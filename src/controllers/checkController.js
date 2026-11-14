const crypto = require('crypto');
const { evaluateWithGemini } = require('../engines/geminiEngine');
const { db, isFirestoreConnected } = require('../config/firebase');
const { resolveOwner } = require('../config/owner');
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
    const { rawInput, language = 'en', deviceId = 'anon_device', minScore = 0 } = req.body;

    if (!rawInput || typeof rawInput !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'rawInput is required and must be a string'
      });
    }

    // Owner = verified Google account, or a valid anonymous device ID.
    // Anyone may run a check; without a valid owner it simply isn't added to any history.
    const { owner = null } = await resolveOwner(req, deviceId);

    const evaluation = await evaluateWithGemini({ rawInput, language });
    const checkId = `chk_${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const effectiveMin = typeof minScore === 'number' ? minScore : 0;
    const finalScore = Math.max(evaluation.score, effectiveMin);
    const finalVerdict = finalScore >= 70 ? 'SCAM' : finalScore >= 30 ? 'CAUTION' : evaluation.verdict;

    const record = {
      id: checkId,
      owner,
      rawInput,
      deviceId,
      score: finalScore,
      verdict: finalVerdict,
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
      extractedUpis: evaluation.extractedUpis || (record.extractedUpi ? [record.extractedUpi] : []),
      engine: record.engine,
      aiEnhanced: record.aiEnhanced,
      // Per-engine scores (Rules / Gemini / Grok) and whether the AI models agreed
      aiOpinions: evaluation.aiOpinions || null,
      agreement: evaluation.agreement || null,
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
    // Only the verified account or the real anonymous device may read its own history
    const resolved = await resolveOwner(req, req.query.deviceId);
    if (!resolved.owner) {
      return res.status(resolved.status).json({ success: false, error: resolved.error });
    }
    const owner = resolved.owner;

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
