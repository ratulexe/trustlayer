const scamDb = require('../data/scamDatabase.json');
const { db, isFirestoreConnected, FieldValue } = require('../config/firebase');

// In-memory fallback counters for session mode (when Firestore is disconnected)
const sessionStats = {
  totalChecks: 0,
  scamDetected: 0,
  cautionDetected: 0,
  safeDetected: 0,
  paymentsBlocked: 0,
  amountProtectedInr: 0,
  communityReports: 0,
  byPattern: {}
};

function findPatternId(rawInput) {
  const lower = String(rawInput || '').toLowerCase();
  for (const p of scamDb.scamPatterns || []) {
    if ((p.triggers || []).some(t => lower.includes(t.toLowerCase()))) {
      return p.id;
    }
  }
  return null;
}

function recordCheckStat({ verdict, score, rawInput }) {
  const isScam = verdict === 'SCAM' || score >= 70;
  const isSafe = verdict === 'SAFE' && score < 30;
  const isCaution = !isScam && !isSafe;
  const patternId = findPatternId(rawInput);

  // Update in-memory session stats
  sessionStats.totalChecks += 1;
  if (isScam) sessionStats.scamDetected += 1;
  else if (isCaution) sessionStats.cautionDetected += 1;
  else sessionStats.safeDetected += 1;

  if (patternId) {
    sessionStats.byPattern[patternId] = (sessionStats.byPattern[patternId] || 0) + 1;
  }

  // Update Firestore stats/global if connected
  if (isFirestoreConnected && db) {
    const updates = {
      totalChecks: FieldValue.increment(1)
    };
    if (isScam) updates.scamDetected = FieldValue.increment(1);
    else if (isCaution) updates.cautionDetected = FieldValue.increment(1);
    else updates.safeDetected = FieldValue.increment(1);

    if (patternId) {
      updates[`byPattern.${patternId}`] = FieldValue.increment(1);
    }

    db.collection('stats').doc('global').set(updates, { merge: true }).catch(err => {
      console.error('[Firestore] Stats increment error:', err.message);
    });
  }
}

function recordBlockedPaymentStat(amount) {
  const numAmount = Math.max(0, parseFloat(amount) || 0);
  sessionStats.paymentsBlocked += 1;
  sessionStats.amountProtectedInr += numAmount;

  if (isFirestoreConnected && db) {
    db.collection('stats').doc('global').set({
      paymentsBlocked: FieldValue.increment(1),
      amountProtectedInr: FieldValue.increment(numAmount)
    }, { merge: true }).catch(err => {
      console.error('[Firestore] Blocked payment stat error:', err.message);
    });
  }
}

function recordCommunityReportStat() {
  sessionStats.communityReports += 1;

  if (isFirestoreConnected && db) {
    db.collection('stats').doc('global').set({
      communityReports: FieldValue.increment(1)
    }, { merge: true }).catch(err => {
      console.error('[Firestore] Report stat error:', err.message);
    });
  }
}

async function handleGetStats(req, res) {
  let data = { ...sessionStats, byPattern: { ...sessionStats.byPattern } };
  let source = 'session';

  if (isFirestoreConnected && db) {
    try {
      const doc = await db.collection('stats').doc('global').get();
      if (doc.exists) {
        const firestoreData = doc.data();
        data = {
          totalChecks: firestoreData.totalChecks || 0,
          scamDetected: firestoreData.scamDetected || 0,
          cautionDetected: firestoreData.cautionDetected || 0,
          safeDetected: firestoreData.safeDetected || 0,
          paymentsBlocked: firestoreData.paymentsBlocked || 0,
          amountProtectedInr: firestoreData.amountProtectedInr || 0,
          communityReports: firestoreData.communityReports || 0,
          byPattern: firestoreData.byPattern || {}
        };
      }
      source = 'live';
    } catch (err) {
      console.error('[Firestore] Failed to read stats/global, falling back to session:', err.message);
      source = 'session';
    }
  }

  const patternCounts = data.byPattern || {};
  const trendingScams = (scamDb.scamPatterns || [])
    .map(p => ({
      id: p.id,
      category: p.category || p.id,
      title: p.title,
      severity: p.severity || 'CRITICAL',
      description: p.explanations?.en || '',
      affectedRegions: p.affectedRegions || ['All India (UPI)'],
      count: patternCounts[p.id] || 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const metrics = {
    scamsBlocked: (data.scamDetected || 0) + (data.paymentsBlocked || 0),
    scamDetected: data.scamDetected || 0,
    cautionDetected: data.cautionDetected || 0,
    safeDetected: data.safeDetected || 0,
    paymentsBlocked: data.paymentsBlocked || 0,
    amountProtectedInr: data.amountProtectedInr || 0,
    totalChecks: data.totalChecks || 0,
    communityReports: data.communityReports || 0,
    activeScamPatterns: (scamDb.scamPatterns || []).length
  };

  res.json({
    success: true,
    source,
    metrics,
    trendingScams
  });
}

module.exports = {
  handleGetStats,
  recordCheckStat,
  recordBlockedPaymentStat,
  recordCommunityReportStat,
  sessionStats
};
