const crypto = require('crypto');
const { db, isFirestoreConnected, verifyIdToken } = require('../config/firebase');
const {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  validateTransaction,
  monthlySummary,
  financialHealthScore,
  generateSampleDiary,
  todayIso
} = require('../financeEngine');

// Per-device money diary. Memory is the fast path; Firestore keeps it across restarts.
// deviceId → { txns: [], budget: number|null }
const diaries = new Map();
const TXN_COLLECTION = 'finance_transactions';
const PROFILE_COLLECTION = 'finance_profiles';
const MAX_TXNS_PER_DEVICE = 2000;

function readDeviceId(req) {
  const id = String((req.body && req.body.deviceId) || req.query.deviceId || '');
  // 'uid_' keys belong to signed-in accounts and are only reachable with a verified token
  return /^[A-Za-z0-9_-]{8,64}$/.test(id) && !id.startsWith('uid_') ? id : null;
}

async function loadDiary(deviceId) {
  if (diaries.has(deviceId)) return diaries.get(deviceId);
  const diary = { txns: [], budget: null };

  if (isFirestoreConnected && db) {
    try {
      const [txnSnap, profileSnap] = await Promise.all([
        db.collection(TXN_COLLECTION).where('deviceId', '==', deviceId).get(),
        db.collection(PROFILE_COLLECTION).doc(deviceId).get()
      ]);
      diary.txns = txnSnap.docs.map((d) => d.data());
      if (profileSnap.exists) diary.budget = profileSnap.data().monthlyBudget ?? null;
    } catch (err) {
      console.error('[Firestore] Finance load error:', err.message);
    }
  }

  diary.txns.sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
  diaries.set(deviceId, diary);
  return diary;
}

function persist(fn) {
  if (!isFirestoreConnected || !db) return;
  Promise.resolve()
    .then(fn)
    .catch((err) => console.error('[Firestore] Finance sync error:', err.message));
}

function sortTxns(diary) {
  diary.txns.sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt));
}

function readBearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

/**
 * Whose diary is this? A signed-in Google user owns 'uid_<uid>'; otherwise the anonymous device ID.
 * Sends the error response and returns null when neither is valid.
 */
async function requireDevice(req, res) {
  const token = readBearer(req);
  if (token) {
    const user = await verifyIdToken(token);
    if (!user) {
      res.status(401).json({ success: false, error: 'Sign-in expired. Please sign in again.' });
      return null;
    }
    return `uid_${user.uid}`;
  }
  const deviceId = readDeviceId(req);
  if (!deviceId) res.status(400).json({ success: false, error: 'deviceId is required (8–64 letters, digits, - or _)' });
  return deviceId;
}

// GET /api/finance/categories
function handleGetCategories(req, res) {
  res.json({ success: true, expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES });
}

// POST /api/finance/transactions
async function handleAddTransaction(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;

  const { value, error } = validateTransaction(req.body);
  if (error) return res.status(400).json({ success: false, error });

  const diary = await loadDiary(deviceId);
  if (diary.txns.length >= MAX_TXNS_PER_DEVICE) {
    return res.status(400).json({ success: false, error: 'Transaction limit reached for this device' });
  }

  const txn = {
    id: `txn_${crypto.randomBytes(5).toString('hex')}`,
    deviceId,
    ...value,
    source: req.body.source === 'safe_pay' ? 'safe_pay' : 'manual',
    createdAt: new Date().toISOString()
  };
  diary.txns.push(txn);
  sortTxns(diary);
  persist(() => db.collection(TXN_COLLECTION).doc(txn.id).set(txn));

  res.status(201).json({ success: true, transaction: txn });
}

// GET /api/finance/transactions?deviceId=&limit=
async function handleListTransactions(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;
  const diary = await loadDiary(deviceId);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
  res.json({ success: true, total: diary.txns.length, transactions: diary.txns.slice(0, limit) });
}

// DELETE /api/finance/transactions/:id?deviceId=
async function handleDeleteTransaction(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;
  const diary = await loadDiary(deviceId);
  const idx = diary.txns.findIndex((t) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Transaction not found' });
  const [removed] = diary.txns.splice(idx, 1);
  persist(() => db.collection(TXN_COLLECTION).doc(removed.id).delete());
  res.json({ success: true, deleted: removed.id });
}

// PUT /api/finance/budget  { deviceId, monthlyBudget }  (null clears it)
async function handleSetBudget(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;
  const raw = req.body.monthlyBudget;
  const budget = raw === null || raw === '' ? null : Number(raw);
  if (budget !== null && (!Number.isFinite(budget) || budget <= 0 || budget > 10000000)) {
    return res.status(400).json({ success: false, error: 'monthlyBudget must be a positive number, or null to clear' });
  }
  const diary = await loadDiary(deviceId);
  diary.budget = budget === null ? null : Math.round(budget);
  persist(() => db.collection(PROFILE_COLLECTION).doc(deviceId).set({ deviceId, monthlyBudget: diary.budget, updatedAt: new Date().toISOString() }));
  res.json({ success: true, monthlyBudget: diary.budget });
}

// GET /api/finance/summary?deviceId=&month=YYYY-MM
async function handleGetSummary(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;
  const month = /^\d{4}-\d{2}$/.test(String(req.query.month || '')) ? req.query.month : todayIso().slice(0, 7);
  const diary = await loadDiary(deviceId);
  res.json({ success: true, summary: monthlySummary(diary.txns, month, diary.budget) });
}

// GET /api/finance/health-score?deviceId=
async function handleGetHealthScore(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;
  const diary = await loadDiary(deviceId);
  res.json({ success: true, healthScore: financialHealthScore(diary.txns, { budget: diary.budget }) });
}

// POST /api/finance/demo-seed { deviceId }  — replaces this device's diary with 60 days of sample data
async function handleDemoSeed(req, res) {
  const deviceId = await requireDevice(req, res);
  if (!deviceId) return;
  const diary = await loadDiary(deviceId);
  const oldIds = diary.txns.map((t) => t.id);
  const sample = generateSampleDiary();
  const createdAt = new Date().toISOString();

  diary.txns = sample.txns.map((t, i) => ({
    id: `txn_demo_${deviceId.slice(0, 8)}_${i}`,
    deviceId,
    ...t,
    source: 'demo',
    createdAt
  }));
  diary.budget = sample.budget;
  sortTxns(diary);

  persist(async () => {
    const writes = [
      ...oldIds.map((id) => (b) => b.delete(db.collection(TXN_COLLECTION).doc(id))),
      ...diary.txns.map((t) => (b) => b.set(db.collection(TXN_COLLECTION).doc(t.id), t)),
      (b) => b.set(db.collection(PROFILE_COLLECTION).doc(deviceId), { deviceId, monthlyBudget: diary.budget, updatedAt: createdAt })
    ];
    for (let i = 0; i < writes.length; i += 450) {
      const batch = db.batch();
      writes.slice(i, i + 450).forEach((w) => w(batch));
      await batch.commit();
    }
  });

  res.json({ success: true, loaded: diary.txns.length, monthlyBudget: diary.budget });
}

// POST /api/finance/claim { deviceId }  (signed in) — moves this phone's anonymous diary into the account
// once, only when the account diary is still empty, so nothing is ever overwritten.
async function handleClaimDeviceDiary(req, res) {
  const token = readBearer(req);
  const user = token ? await verifyIdToken(token) : null;
  if (!user) return res.status(401).json({ success: false, error: 'Sign in first' });
  const deviceId = readDeviceId(req);
  if (!deviceId) return res.status(400).json({ success: false, error: 'deviceId is required' });

  const ownerKey = `uid_${user.uid}`;
  const [account, device] = await Promise.all([loadDiary(ownerKey), loadDiary(deviceId)]);
  if (account.txns.length > 0 || device.txns.length === 0) {
    return res.json({ success: true, moved: 0 });
  }

  account.txns = device.txns.map((t) => ({ ...t, deviceId: ownerKey }));
  account.budget = account.budget ?? device.budget;
  device.txns = [];
  device.budget = null;

  persist(async () => {
    for (let i = 0; i < account.txns.length; i += 450) {
      const batch = db.batch();
      account.txns.slice(i, i + 450).forEach((t) => batch.set(db.collection(TXN_COLLECTION).doc(t.id), t));
      await batch.commit();
    }
    await db.collection(PROFILE_COLLECTION).doc(ownerKey).set({ deviceId: ownerKey, monthlyBudget: account.budget, updatedAt: new Date().toISOString() });
    await db.collection(PROFILE_COLLECTION).doc(deviceId).delete();
  });

  res.json({ success: true, moved: account.txns.length });
}

module.exports = {
  handleClaimDeviceDiary,
  handleGetCategories,
  handleAddTransaction,
  handleListTransactions,
  handleDeleteTransaction,
  handleSetBudget,
  handleGetSummary,
  handleGetHealthScore,
  handleDemoSeed
};
