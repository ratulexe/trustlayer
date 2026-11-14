// TrustLayer Multi-Vector Risk & Threat Shield Engine
const crypto = require('crypto');

// Simulated known blacklist and mule cluster database
const KNOWN_MULE_VPAS = new Set([
  'lottery_reward99@okhdfc',
  'urgent_kyc_update@ybl',
  'fastcash_refund@paytm',
  'job_guarantee_deposit@ibl'
]);

const VERIFIED_MERCHANTS = new Map([
  ['grocer@okaxis', { name: 'Sharma Daily Groceries', category: 'Grocery', trustRating: 0.98, ageDays: 780 }],
  ['ramu.tea@upi', { name: 'Ramu Tea Stall', category: 'Street Food', trustRating: 0.94, ageDays: 420 }],
  ['metro.transit@sbi', { name: 'City Metro Rail', category: 'Transit', trustRating: 0.99, ageDays: 1200 }]
]);

// In-memory velocity tracker (VPA -> array of recent timestamps & amounts)
const velocityCache = new Map();

function evaluateRisk({ payerVpa, payeeVpa, amount, payerDevice, paymentNote = '' }) {
  const startTime = Date.now();
  let riskScore = 5; // Base minimal risk
  const riskFactors = [];
  const signals = {
    muleAccountRisk: 0,
    velocityAnomaly: 0,
    newAccountExposure: 0,
    socialEngineeringKeywordRisk: 0,
    amountDeviation: 0
  };

  const cleanPayee = (payeeVpa || '').toLowerCase().trim();
  const numAmount = parseFloat(amount) || 0;

  // 1. Direct Mule & Blacklist check
  if (KNOWN_MULE_VPAS.has(cleanPayee)) {
    riskScore += 85;
    signals.muleAccountRisk = 95;
    riskFactors.push({
      level: 'CRITICAL',
      rule: 'MULE_NETWORK_MATCH',
      description: 'Payee VPA is flagged in the Inter-Bank Mule Account Intelligence Cluster.'
    });
  }

  // 2. Verified Merchant discount
  const verifiedMerchant = VERIFIED_MERCHANTS.get(cleanPayee);
  if (verifiedMerchant) {
    riskScore = Math.max(2, riskScore - 15);
    riskFactors.push({
      level: 'SAFE',
      rule: 'VERIFIED_TRUSTED_MERCHANT',
      description: `Payee is a verified merchant (${verifiedMerchant.name}) with ${verifiedMerchant.ageDays} days clean operational history.`
    });
  } else if (!KNOWN_MULE_VPAS.has(cleanPayee)) {
    // Unverified / Individual peer
    if (cleanPayee.includes('reward') || cleanPayee.includes('prize') || cleanPayee.includes('refund') || cleanPayee.includes('kyc')) {
      riskScore += 45;
      signals.socialEngineeringKeywordRisk = 80;
      riskFactors.push({
        level: 'HIGH',
        rule: 'SUSPICIOUS_VPA_PATTERN',
        description: 'Payee handle contains keywords frequently associated with social engineering and phishing campaigns.'
      });
    } else {
      riskScore += 10;
      signals.newAccountExposure = 25;
      riskFactors.push({
        level: 'MODERATE',
        rule: 'UNVERIFIED_COUNTERPARTY',
        description: 'First-time transfer to an unverified private VPA.'
      });
    }
  }

  // 3. Phishing / Social Engineering Note Analysis
  const suspiciousKeywords = ['lottery', 'otp', 'winner', 'prize', 'kyc', 'tax clearance', 'urgent deposit', 'pin'];
  const lowerNote = paymentNote.toLowerCase();
  for (const kw of suspiciousKeywords) {
    if (lowerNote.includes(kw)) {
      riskScore += 40;
      signals.socialEngineeringKeywordRisk = Math.max(signals.socialEngineeringKeywordRisk, 85);
      riskFactors.push({
        level: 'CRITICAL',
        rule: 'COERCION_KEYWORD_DETECTED',
        description: `Payment note references high-scam terminology ('${kw}'). Possible vishing/coercion scam.`
      });
      break;
    }
  }

  // 4. Velocity Check
  const now = Date.now();
  const payerHistory = velocityCache.get(payerVpa) || [];
  // Filter transactions in last 5 minutes (300,000 ms)
  const recentTxns = payerHistory.filter(t => now - t.timestamp < 300000);
  
  if (recentTxns.length >= 4) {
    riskScore += 30;
    signals.velocityAnomaly = 75;
    riskFactors.push({
      level: 'HIGH',
      rule: 'HIGH_VELOCITY_BURST',
      description: `Burst of ${recentTxns.length + 1} transactions detected within 5 minutes. Potential account takeover.`
    });
  }

  // 5. High Value Ticket Anomaly
  if (numAmount >= 25000 && !verifiedMerchant) {
    riskScore += 25;
    signals.amountDeviation = 60;
    riskFactors.push({
      level: 'MODERATE',
      rule: 'HIGH_VALUE_UNVERIFIED_OUTFLOW',
      description: 'Transaction exceeds ₹25,000 to an unverified private counterparty.'
    });
  }

  // Cap score between 0 and 100
  const finalRiskScore = Math.min(100, Math.max(1, riskScore));

  // Determine policy action
  let decision = 'APPROVE';
  let escrowDelaySeconds = 0;
  let actionMessage = 'Transaction approved with sub-50ms clearance.';

  if (finalRiskScore >= 70) {
    decision = 'BLOCK';
    actionMessage = 'Transaction blocked: High confidence fraud indicator detected. Funds protected.';
  } else if (finalRiskScore >= 35) {
    decision = 'SMART_ESCROW';
    escrowDelaySeconds = 900; // 15-minute escrow protection window
    actionMessage = 'Transaction placed in 15-Minute Smart Escrow. Buyer has protection window to review or recall.';
  }

  // Update velocity cache
  payerHistory.push({ timestamp: now, amount: numAmount });
  velocityCache.set(payerVpa, payerHistory);

  const latencyMs = Date.now() - startTime;

  return {
    riskScore: finalRiskScore,
    decision,
    escrowDelaySeconds,
    actionMessage,
    signals,
    riskFactors,
    latencyMs: Math.max(12, latencyMs),
    evaluatedAt: new Date().toISOString()
  };
}

module.exports = {
  evaluateRisk,
  KNOWN_MULE_VPAS,
  VERIFIED_MERCHANTS
};
