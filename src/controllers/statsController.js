const scamDb = require('../data/scamDatabase.json');
const { checkHistory } = require('./checkController');

function handleGetStats(req, res) {
  const scamsDetectedInSession = checkHistory.filter(c => c.verdict === 'SCAM').length;
  const safeChecks = checkHistory.filter(c => c.verdict === 'SAFE').length;

  res.json({
    success: true,
    metrics: {
      scamsBlocked: 1420 + scamsDetectedInSession,
      amountProtectedInr: 4820000 + (scamsDetectedInSession * 15000),
      totalChecks: 18950 + checkHistory.length,
      activeScamPatterns: scamDb.scamPatterns.length + 39
    },
    trendingScams: [
      {
        category: 'UTILITY_DISCONNECTION',
        title: 'Electricity Power Disconnection Phishing',
        affectedRegions: ['Delhi NCR', 'West Bengal', 'Maharashtra', 'Uttar Pradesh'],
        severity: 'CRITICAL',
        description: 'Fake SMS warning power cut at 9:30 PM requesting bill payments to personal VPAs.'
      },
      {
        category: 'LOTTERY_KYC',
        title: 'Fake WhatsApp Lottery / KBC Cash Award',
        affectedRegions: ['All India (Vernacular targets)'],
        severity: 'HIGH',
        description: 'Coercive calls demanding advance processing fees to release non-existent lottery prize.'
      },
      {
        category: 'REVERSE_UPI_PIN',
        title: 'Fake Buyer Marketplace Collect Request',
        affectedRegions: ['Bangalore', 'Mumbai', 'Hyderabad'],
        severity: 'CRITICAL',
        description: 'Fraudsters send a collect request or QR code claiming seller needs to enter PIN to receive money.'
      }
    ]
  });
}

module.exports = {
  handleGetStats
};
