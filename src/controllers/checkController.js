const crypto = require('crypto');
const { evaluateWithGemini } = require('../engines/geminiEngine');
const { db, isFirestoreConnected, verifyIdToken } = require('../config/firebase');
const { recordCheckStat } = require('./statsController');

// In-memory store for fast local checks history (synced with Firestore when enabled)
const checkHistory = [];

// PRD 3.2: moderate-risk (Caution) payments need a cool-down and explicit confirmation.
// Override for live demos, e.g. CAUTION_COOLDOWN_SECONDS=20
const parsedCooldown = parseInt(process.env.CAUTION_COOLDOWN_SECONDS, 10);
const CAUTION_COOLDOWN_SECONDS = Number.isInteger(parsedCooldown) && parsedCooldown >= 0 ? parsedCooldown : 15 * 60;

// Same tiers as the UI: Scam >= 70 (or SCAM verdict), Safe < 30 with SAFE verdict, Caution otherwise
function isCautionTier({ score, verdict }) {
  const isScam = verdict === 'SCAM' || score >= 70;
  const isSafe = verdict === 'SAFE' && score < 30;
  return !isScam && !isSafe;
}

async function handleCheck(req, res) {
  try {
    const { rawInput, language = 'en', deviceId = 'anon_device' } = req.body;

    if (!rawInput || typeof rawInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'rawInput is required and must be a string'
      });
    }

    // Determine owner from Bearer token if signed in, otherwise deviceId
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = await verifyIdToken(idToken);
    const owner = user?.uid ? `uid_${user.uid}` : (deviceId || 'anon_device');

    const evaluation = await evaluateWithGemini({ rawInput, language });
    const checkId = `chk_${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const record = {
      id: checkId,
      owner,
      rawInput,
      deviceId,
      score: evaluation.score,
      verdict: evaluation.verdict,
      reasons: evaluation.reasons,
      vernacularExplanation: evaluation.vernacularExplanation,
      extractedUpi: evaluation.extractedUpi,
      language,
      engine: evaluation.engine,
      aiEnhanced: evaluation.aiEnhanced,
      latencyMs: evaluation.latencyMs,
      timestamp
    };

    checkHistory.unshift(record);
    if (checkHistory.length > 50) checkHistory.pop();

    // Increment community stats counters
    recordCheckStat({
      verdict: record.verdict,
      score: record.score,
      rawInput: record.rawInput
    });

    // Async write to Cloud Firestore if connected
    if (isFirestoreConnected && db) {
      db.collection('checks').doc(checkId).set(record).catch(err => {
        console.error('[Firestore] Check sync error:', err.message);
      });
    }

    res.json({
      success: true,
      checkId,
      score: record.score,
      verdict: record.verdict,
      reasons: record.reasons,
      vernacularExplanation: record.vernacularExplanation,
      extractedUpi: record.extractedUpi,
      engine: record.engine,
      aiEnhanced: record.aiEnhanced,
      latencyMs: record.latencyMs,
      timestamp,
      cautionRequired: isCautionTier(record),
      cooldownSeconds: isCautionTier(record) ? CAUTION_COOLDOWN_SECONDS : 0
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'CHECK_EVALUATION_FAILED',
      message: err.message
    });
  }
}

async function handleGetHistory(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = await verifyIdToken(idToken);
    const owner = user?.uid ? `uid_${user.uid}` : req.query.deviceId;

    // Reject if no owner identified (neither valid token nor deviceId)
    if (!owner || typeof owner !== 'string' || !owner.trim()) {
      return res.status(400).json({
        success: false,
        error: 'deviceId query parameter or Authorization Bearer token is required'
      });
    }

    let records = [];

    if (isFirestoreConnected && db) {
      try {
        const snapshot = await db.collection('checks')
          .where('owner', '==', owner)
          .get();
        snapshot.forEach(doc => records.push(doc.data()));
        // Sort descending by timestamp
        records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      } catch (err) {
        console.error('[Firestore] History query error, falling back to memory:', err.message);
        records = checkHistory.filter(r => r.owner === owner);
      }
    } else {
      records = checkHistory.filter(r => r.owner === owner);
    }

    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const history = records.slice(0, limit).map(r => ({
      checkId: r.id,
      snippet: r.rawInput.length > 60 ? r.rawInput.substring(0, 60) + '...' : r.rawInput,
      verdict: r.verdict,
      score: r.score,
      extractedUpi: r.extractedUpi,
      date: r.timestamp
    }));

    res.json({
      success: true,
      total: history.length,
      history
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'HISTORY_FETCH_FAILED',
      message: err.message
    });
  }
}

module.exports = {
  handleCheck,
  handleGetHistory,
  checkHistory,
  isCautionTier,
  CAUTION_COOLDOWN_SECONDS
};
