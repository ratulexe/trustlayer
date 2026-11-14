const { db, isFirestoreConnected, verifyIdToken } = require('../config/firebase');
const { checkHistory } = require('./checkController');
const { recordCommunityReportStat } = require('./statsController');

// In-memory set for duplicate tracking in session fallback mode
const reportedInSession = new Set();

async function handleReport(req, res) {
  try {
    const { checkId, deviceId } = req.body || {};

    if (!checkId || typeof checkId !== 'string' || !/^chk_[a-zA-Z0-9_-]+$/.test(checkId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing checkId'
      });
    }

    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const user = await verifyIdToken(idToken);
    const owner = user?.uid ? `uid_${user.uid}` : deviceId;

    if (!owner || typeof owner !== 'string' || !owner.trim()) {
      return res.status(400).json({
        success: false,
        error: 'deviceId or valid Bearer token is required'
      });
    }

    // Retrieve the check to validate ownership and verdict
    let check = checkHistory.find(c => c.id === checkId);
    if (!check && isFirestoreConnected && db) {
      try {
        const checkDoc = await db.collection('checks').doc(checkId).get();
        if (checkDoc.exists) {
          check = checkDoc.data();
        }
      } catch (err) {
        console.error('[Firestore] Check lookup for report failed:', err.message);
      }
    }

    if (!check) {
      return res.status(404).json({
        success: false,
        error: 'Check not found'
      });
    }

    // Verify ownership
    if (check.owner && check.owner !== owner) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: check does not belong to this owner'
      });
    }

    // Verify verdict is SCAM or CAUTION
    const isReportable = check.verdict === 'SCAM' || check.verdict === 'CAUTION' || (check.score && check.score >= 30);
    if (!isReportable) {
      return res.status(400).json({
        success: false,
        error: 'Only SCAM or CAUTION checks can be reported'
      });
    }

    const sanitizedOwner = String(owner).replace(/[^a-zA-Z0-9_-]/g, '_');
    const reportDocId = `${checkId}_${sanitizedOwner}`;

    // Check if already reported in session
    if (reportedInSession.has(reportDocId)) {
      return res.json({
        success: true,
        alreadyReported: true,
        message: 'Already reported'
      });
    }

    if (isFirestoreConnected && db) {
      const reportRef = db.collection('reports').doc(reportDocId);
      const existingDoc = await reportRef.get();
      if (existingDoc.exists) {
        reportedInSession.add(reportDocId);
        return res.json({
          success: true,
          alreadyReported: true,
          message: 'Already reported'
        });
      }

      const reportData = {
        checkId,
        owner,
        extractedUpi: check.extractedUpi || null,
        verdict: check.verdict,
        timestamp: new Date().toISOString()
      };

      await reportRef.set(reportData);
    }

    reportedInSession.add(reportDocId);
    recordCommunityReportStat();

    res.json({
      success: true,
      message: 'Reported successfully'
    });
  } catch (err) {
    console.error('[Report] Error submitting scam report:', err);
    res.status(500).json({
      success: false,
      error: 'REPORT_FAILED',
      message: err.message
    });
  }
}

module.exports = {
  handleReport
};
