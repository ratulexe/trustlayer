const crypto = require('crypto');
const scamDb = require('../data/scamDatabase.json');
const { checkHistory } = require('./checkController');

const paymentsHistory = [];
const idempotencyStore = new Map();

/**
 * Generates an NPCI-compliant UPI Intent URI
 */
function buildUpiUri({ upiId, payeeName, amount, note, txnRef, merchantCode }) {
  const params = new URLSearchParams({
    pa: upiId.toLowerCase().trim(),
    pn: payeeName || 'Merchant',
    am: parseFloat(amount).toFixed(2),
    cu: 'INR',
    tn: note || 'TrustLayer Verified Pay',
    tr: txnRef || `TL${Date.now()}`
  });

  if (merchantCode) {
    params.append('mc', merchantCode);
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Parses raw UPI QR Code payload strings (upi://pay?pa=...&pn=...)
 */
function parseUpiQr(rawQrString = '') {
  if (!rawQrString || !rawQrString.startsWith('upi://pay')) {
    throw new Error('Invalid UPI QR code format. Must start with upi://pay');
  }

  const url = new URL(rawQrString);
  const params = url.searchParams;

  const upiId = params.get('pa');
  if (!upiId) throw new Error('QR code missing required payee address (pa)');

  return {
    upiId: upiId.toLowerCase().trim(),
    payeeName: params.get('pn') || 'Merchant',
    amount: params.get('am') ? parseFloat(params.get('am')) : null,
    merchantCode: params.get('mc') || null,
    transactionRef: params.get('tr') || null,
    note: params.get('tn') || '',
    currency: params.get('cu') || 'INR'
  };
}

/**
 * Controller: POST /api/pay
 */
function handlePay(req, res) {
  try {
    const { 
      checkId, 
      upiId, 
      payeeName = 'Merchant', 
      amount = 100, 
      note = 'TrustLayer Verified Pay',
      merchantCode,
      idempotencyKey 
    } = req.body;

    if (!upiId) {
      return res.status(400).json({ success: false, error: 'upiId is required' });
    }

    // Idempotency check: prevent duplicate debits on network retry
    if (idempotencyKey && idempotencyStore.has(idempotencyKey)) {
      return res.json({
        success: true,
        isIdempotentReplay: true,
        ...idempotencyStore.get(idempotencyKey)
      });
    }

    const cleanUpi = upiId.toLowerCase().trim();

    // 1. Hard Block if known mule or scam
    if (scamDb.knownMuleVpas.includes(cleanUpi)) {
      return res.status(403).json({
        success: false,
        error: 'PAYMENT_BLOCKED',
        verdict: 'SCAM',
        message: 'This payment recipient was flagged as high-risk fraud (Mule Intelligence). Outflow blocked for consumer protection.'
      });
    }

    // 2. Cross-reference checkId if provided
    let riskVerdict = 'SAFE';
    let riskScore = 8;
    if (checkId) {
      const pastCheck = checkHistory.find(c => c.id === checkId);
      if (pastCheck) {
        riskScore = pastCheck.score;
        riskVerdict = pastCheck.verdict;
        if (pastCheck.verdict === 'SCAM') {
          return res.status(403).json({
            success: false,
            error: 'PAYMENT_BLOCKED',
            verdict: 'SCAM',
            message: `This payment is blocked due to recent Scam Scan verdict (Risk Score: ${pastCheck.score}).`
          });
        }
      }
    }

    const paymentId = `pay_${crypto.randomBytes(4).toString('hex')}`;
    const txnRef = `TL_${Date.now()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const cleanAmount = parseFloat(amount).toFixed(2);

    // Build standard NPCI URI
    const upiDeepLink = buildUpiUri({
      upiId: cleanUpi,
      payeeName,
      amount: cleanAmount,
      note,
      txnRef,
      merchantCode
    });

    const isEscrowAdvised = riskVerdict === 'CAUTION' || (riskScore >= 35 && riskScore < 70);

    const paymentRecord = {
      paymentId,
      transactionRef: txnRef,
      checkId: checkId || null,
      upiId: cleanUpi,
      payeeName,
      amount: parseFloat(cleanAmount),
      currency: 'INR',
      status: isEscrowAdvised ? 'ESCROW_RECOMMENDED' : 'INITIATED',
      upiDeepLink,
      securitySeal: {
        isVerified: true,
        riskScore,
        riskVerdict,
        escrowAdvisory: isEscrowAdvised ? {
          recommended: true,
          coolingPeriodMinutes: 15,
          reason: 'Unverified private counterparty'
        } : null,
        sha256PayloadSignature: crypto.createHash('sha256').update(upiDeepLink).digest('hex').substring(0, 16),
        issuedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    paymentsHistory.unshift(paymentRecord);
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, paymentRecord);
    }

    res.json({
      success: true,
      ...paymentRecord
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'PAYMENT_GENERATION_FAILED',
      message: err.message
    });
  }
}

/**
 * Controller: POST /api/qr/parse
 * Decodes and risk-evaluates scanned UPI QR code
 */
function handleParseQr(req, res) {
  try {
    const { qrString } = req.body;
    if (!qrString) {
      return res.status(400).json({ success: false, error: 'qrString is required' });
    }

    const parsed = parseUpiQr(qrString);
    const isMule = scamDb.knownMuleVpas.includes(parsed.upiId);
    const verified = scamDb.verifiedMerchants.find(m => m.vpa === parsed.upiId);

    const riskScore = isMule ? 95 : verified ? 5 : 35;
    const verdict = isMule ? 'SCAM' : verified ? 'SAFE' : 'CAUTION';

    res.json({
      success: true,
      parsed,
      preflightRisk: {
        score: riskScore,
        verdict,
        isVerifiedMerchant: !!verified,
        merchantDetails: verified || null,
        isMuleFlagged: isMule
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'QR_PARSE_FAILED',
      message: err.message
    });
  }
}

function handleGetPayments(req, res) {
  res.json({
    success: true,
    total: paymentsHistory.length,
    payments: paymentsHistory.slice(0, 20)
  });
}

module.exports = {
  handlePay,
  handleParseQr,
  handleGetPayments,
  buildUpiUri,
  parseUpiQr,
  paymentsHistory
};
