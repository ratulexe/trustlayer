const express = require('express');
const cors = require('cors');
const path = require('path');
const { handleCheck, handleGetHistory } = require('./src/controllers/checkController');
const { handlePay, handleParseQr, handleGetPayments } = require('./src/controllers/payController');
const { handleGetStats } = require('./src/controllers/statsController');
const { evaluateRisk } = require('./src/riskEngine');
const { ledger } = require('./src/ledger');
const { generateSimulatedMerchantHistory, calculateTrustScore } = require('./src/creditEngine');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets from client/dist (React + Vite PWA)
app.use(express.static(path.join(__dirname, 'client/dist')));

// --- CORE ARCHITECTURE SPECIFICATION API ENDPOINTS ---

// 1. POST /api/check (Analyze message/UPI via Dual-Engine Threat Shield)
app.post('/api/check', handleCheck);

// 2. POST /api/pay (Verify payee & generate standard upi://pay deep-link)
app.post('/api/pay', handlePay);

// 2b. POST /api/qr/parse (Parse raw UPI QR code & run pre-flight check)
app.post('/api/qr/parse', handleParseQr);

// 2c. GET /api/payments (Audit recent verified payment intents)
app.get('/api/payments', handleGetPayments);

// 3. GET /api/history (User's scan history)
app.get('/api/history', handleGetHistory);

// 4. GET /api/stats (Community scam metrics & trending threat vectors)
app.get('/api/stats', handleGetStats);

// 5. GET /api/scenarios (Presets for 10:30 AM evaluation round)
app.get('/api/scenarios', (req, res) => {
  res.json([
    {
      id: 'electricity-cut',
      title: 'Electricity Disconnection Scam',
      badge: 'Critical Scam (92/100)',
      input: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office. Please immediately call officer at 9876543210 or pay pending bill to powerbill@okaxis',
      targetUpi: 'powerbill@okaxis',
      expectedVerdict: 'SCAM'
    },
    {
      id: 'lottery-prize',
      title: 'WhatsApp 25-Lakh Lottery Scam',
      badge: 'Critical Scam (95/100)',
      input: 'Congratulations! You won ₹25,00,000 in Special Scheme. To release your fund immediately transfer processing tax of ₹12,500 to lottery_reward99@okhdfc',
      targetUpi: 'lottery_reward99@okhdfc',
      expectedVerdict: 'SCAM'
    },
    {
      id: 'safe-grocer',
      title: 'Safe Local Grocer Payment',
      badge: 'Verified Safe (8/100)',
      input: 'Payment for weekly household groceries at Sharma Store. Pay ₹350 to grocer@okaxis',
      targetUpi: 'grocer@okaxis',
      expectedVerdict: 'SAFE'
    }
  ]);
});

// Financial Inclusion & Cryptographic Audit Ledger APIs (from Track Blueprint)
const sampleMerchantData = generateSimulatedMerchantHistory('ramu-tea-stall');

app.get('/api/merchants/ramu-tea-stall/credit-profile', (req, res) => {
  const scoreData = calculateTrustScore(sampleMerchantData);
  res.json({
    merchant: sampleMerchantData,
    creditAssessment: scoreData
  });
});

app.post('/api/credit/drawdown', (req, res) => {
  const { amount = 5000, tenureDays = 30 } = req.body;
  const scoreData = calculateTrustScore(sampleMerchantData);
  const loanAmount = Number(amount);
  const tenure = Number(tenureDays);

  if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be a positive number'
    });
  }

  if (!Number.isInteger(tenure) || tenure <= 0 || tenure > 365) {
    return res.status(400).json({
      success: false,
      error: 'tenureDays must be a whole number between 1 and 365'
    });
  }

  if (loanAmount > scoreData.preApprovedLimit) {
    return res.status(400).json({
      success: false,
      error: `Requested amount ₹${loanAmount} exceeds pre-approved limit of ₹${scoreData.preApprovedLimit}`
    });
  }

  const loanId = `LOAN_${Date.now()}`;
  const dailyDeduct = Math.round((loanAmount * (1 + (scoreData.interestRateApr / 100) * (tenure / 365))) / tenure);

  res.json({
    success: true,
    message: `₹${loanAmount.toLocaleString('en-IN')} disbursed instantly to ${sampleMerchantData.vpa} via UPI Rail!`,
    loan: {
      loanId,
      amount: loanAmount,
      tenureDays: tenure,
      apr: scoreData.interestRateApr,
      dailyDeduction: dailyDeduct,
      status: 'ACTIVE_DISBURSED',
      timestamp: new Date().toISOString()
    }
  });
});

app.get('/api/ledger', (req, res) => {
  res.json({
    chainLength: ledger.entries.length,
    latestHash: ledger.latestHash,
    entries: ledger.getEntries(25)
  });
});

app.post('/api/transactions/evaluate', (req, res) => {
  const { payerVpa, payeeVpa, amount, paymentNote, idempotencyKey } = req.body;
  const riskResult = evaluateRisk({
    payerVpa: payerVpa || 'user@upi',
    payeeVpa: payeeVpa || 'merchant@upi',
    amount: amount || 100,
    paymentNote: paymentNote || ''
  });

  const { entry } = ledger.appendTransaction({
    idempotencyKey,
    payerVpa: payerVpa || 'user@upi',
    payeeVpa: payeeVpa || 'merchant@upi',
    amount: amount || 100,
    riskResult
  });

  res.json({
    success: true,
    transaction: entry,
    riskEvaluation: riskResult
  });
});

// Fallback route to React client index.html for SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`[TrustLayer] Rail API online at http://localhost:${PORT}`);
});
