const express = require('express');
const cors = require('cors');
const path = require('path');
const { evaluateRisk, KNOWN_MULE_VPAS, VERIFIED_MERCHANTS } = require('./src/riskEngine');
const { generateSimulatedMerchantHistory, calculateTrustScore } = require('./src/creditEngine');
const { ledger } = require('./src/ledger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Pre-load a sample informal merchant profile
const sampleMerchantData = generateSimulatedMerchantHistory('ramu-tea-stall');
let activeLoans = [];

// 1. Evaluate and Execute Transaction
app.post('/api/transactions/evaluate', (req, res) => {
  const { payerVpa, payeeVpa, amount, paymentNote, payerDevice, idempotencyKey } = req.body;

  if (!payerVpa || !payeeVpa || !amount) {
    return res.status(400).json({ error: 'payerVpa, payeeVpa, and amount are required' });
  }

  // Risk Engine evaluation
  const riskResult = evaluateRisk({
    payerVpa,
    payeeVpa,
    amount,
    payerDevice: payerDevice || 'Android-Pixel7-UPI-Client',
    paymentNote: paymentNote || ''
  });

  // Cryptographic Ledger entry
  const { entry, isDuplicate } = ledger.appendTransaction({
    idempotencyKey,
    payerVpa,
    payeeVpa,
    amount,
    riskResult
  });

  res.json({
    success: true,
    isDuplicate,
    transaction: entry,
    riskEvaluation: riskResult
  });
});

// 2. Fetch Immutable Audit Ledger
app.get('/api/ledger', (req, res) => {
  res.json({
    chainLength: ledger.entries.length,
    latestHash: ledger.latestHash,
    entries: ledger.getEntries(25)
  });
});

// 3. Financial Inclusion: Merchant Cashflow Credit Assessment
app.get('/api/merchants/:id/credit-profile', (req, res) => {
  const scoreData = calculateTrustScore(sampleMerchantData);
  res.json({
    merchant: {
      id: sampleMerchantData.merchantId,
      name: sampleMerchantData.name,
      vpa: sampleMerchantData.vpa,
      category: sampleMerchantData.category,
      location: sampleMerchantData.location,
      establishedDays: sampleMerchantData.establishedDays,
      total30DayVolume: sampleMerchantData.totalVolume,
      total30DayTxns: sampleMerchantData.totalTransactions
    },
    creditAssessment: scoreData,
    activeLoans
  });
});

// 4. Instant Micro-Loan Drawdown (Financial Inclusion workflow)
app.post('/api/credit/drawdown', (req, res) => {
  const { amount, tenureDays = 30 } = req.body;
  const scoreData = calculateTrustScore(sampleMerchantData);

  if (amount > scoreData.preApprovedLimit) {
    return res.status(400).json({
      error: `Requested amount ₹${amount} exceeds pre-approved limit ₹${scoreData.preApprovedLimit}`
    });
  }

  const loanId = `LOAN_${Date.now()}`;
  const loanRecord = {
    loanId,
    disbursedAt: new Date().toISOString(),
    amount: parseFloat(amount),
    interestRateApr: scoreData.interestRateApr,
    tenureDays,
    dailyDeduction: Math.round((amount * (1 + (scoreData.interestRateApr/100) * (tenureDays/365))) / tenureDays),
    status: 'ACTIVE_DISBURSED',
    disbursementMethod: 'INSTANT_UPI_CREDIT_TO_VPA'
  };

  activeLoans.push(loanRecord);

  res.json({
    success: true,
    message: `₹${amount} disbursed instantly to ${sampleMerchantData.vpa} via UPI Rail!`,
    loan: loanRecord
  });
});

// 5. Preset Scenarios for Live Evaluation Demo
app.get('/api/scenarios', (req, res) => {
  res.json([
    {
      id: 'safe-grocery',
      title: '1. Safe Grocery Payment (Fast-Path)',
      description: 'Payer sends ₹350 to a verified neighbourhood grocer with 780 days clean history.',
      payload: {
        payerVpa: 'priya.sharma@okaxis',
        payeeVpa: 'grocer@okaxis',
        amount: 350,
        paymentNote: 'Weekly vegetable bill'
      },
      expectedOutcome: 'APPROVE',
      expectedBadge: 'Low Risk (<10)',
      focusArea: 'UPI Integration & Seamless UX'
    },
    {
      id: 'mule-scam',
      title: '2. Inter-Bank Mule Scam Interception',
      description: 'Payer transfers ₹18,500 to a newly created handle flagged in mule network databases.',
      payload: {
        payerVpa: 'amit.verma@sbi',
        payeeVpa: 'lottery_reward99@okhdfc',
        amount: 18500,
        paymentNote: 'Claim lottery prize OTP'
      },
      expectedOutcome: 'BLOCK',
      expectedBadge: 'Critical Risk (>90)',
      focusArea: 'Fraud Mitigation'
    },
    {
      id: 'escrow-unverified',
      title: '3. Unverified Marketplace Transfer',
      description: 'Payer sends ₹3,500 to an unknown individual for second-hand electronics.',
      payload: {
        payerVpa: 'rahul.k@icici',
        payeeVpa: 'seller.gadgets.unknown@paytm',
        amount: 3500,
        paymentNote: 'Used smartphone advance deposit'
      },
      expectedOutcome: 'SMART_ESCROW',
      expectedBadge: 'Moderate Risk (Escrow Hold)',
      focusArea: 'Transactional Reliability & Buyer Protection'
    }
  ]);
});

app.listen(PORT, () => {
  console.log(`[TrustLayer] Rail service listening on http://localhost:${PORT}`);
});
