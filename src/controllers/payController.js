const crypto = require('crypto');
const scamDb = require('../data/scamDatabase.json');
const { checkHistory } = require('./checkController');
const { db, isFirestoreConnected } = require('../config/firebase');

const paymentsHistory = [];

function handlePay(req, res) {
  try {
    const { checkId, upiId, payeeName = 'Merchant', amount = 100, note = 'TrustLayer Verified Pay' } = req.body;

    if (!upiId) {
      return res.status(400).json({ success: false, error: 'upiId is required' });
    }

    const cleanUpi = upiId.toLowerCase().trim();

    // Check if directly blacklisted
    if (scamDb.knownMuleVpas.includes(cleanUpi)) {
      return res.status(403).json({
        success: false,
        error: 'PAYMENT_BLOCKED',
        message: 'This payment recipient was flagged as high-risk fraud (Mule Intelligence). Outflow blocked for consumer protection.'
      });
    }

    // Check checkId status if provided
    if (checkId) {
      const pastCheck = checkHistory.find(c => c.id === checkId);
      if (pastCheck && pastCheck.verdict === 'SCAM') {
        return res.status(403).json({
          success: false,
          error: 'PAYMENT_BLOCKED',
          message: `This payment is blocked due to recent Scam Scan verdict (Risk Score: ${pastCheck.score}).`
        });
      }
    }

    const paymentId = `pay_${crypto.randomBytes(4).toString('hex')}`;
    const cleanAmount = parseFloat(amount).toFixed(2);
    const encodedPayee = encodeURIComponent(payeeName);
    const encodedNote = encodeURIComponent(note);

    // Standard NPCI UPI URI Specification
    const upiDeepLink = `upi://pay?pa=${cleanUpi}&pn=${encodedPayee}&am=${cleanAmount}&cu=INR&tn=${encodedNote}`;

    const paymentRecord = {
      id: paymentId,
      checkId: checkId || null,
      upiId: cleanUpi,
      payeeName,
      amount: parseFloat(cleanAmount),
      currency: 'INR',
      status: 'INITIATED',
      upiDeepLink,
      securitySeal: {
        isVerified: true,
        verificationType: 'HEURISTIC_MERCHANT_ASSESSMENT',
        issuedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    paymentsHistory.unshift(paymentRecord);

    // Async write to Cloud Firestore if connected
    if (isFirestoreConnected && db) {
      db.collection('payments').doc(paymentId).set(paymentRecord).catch(err => {
        console.error('[Firestore] Payment sync error:', err.message);
      });
    }

    res.json({
      success: true,
      paymentId,
      status: 'INITIATED',
      upiDeepLink,
      securitySeal: paymentRecord.securitySeal,
      timestamp: paymentRecord.timestamp
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'PAYMENT_GENERATION_FAILED',
      message: err.message
    });
  }
}

module.exports = {
  handlePay,
  paymentsHistory
};
