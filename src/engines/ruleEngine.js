// Heuristic Rule Engine (Deterministic, sub-20ms execution)
const scamDb = require('../data/scamDatabase.json');

function extractUpi(text = '') {
  const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
  const matches = text.match(upiRegex);
  return matches ? matches[0].toLowerCase() : null;
}

function runRuleEngine({ rawInput = '', language = 'en' }) {
  const startTime = Date.now();
  const lowerText = rawInput.toLowerCase();
  const extractedUpi = extractUpi(rawInput);
  
  let score = 5;
  const reasons = [];
  let verdict = 'SAFE';
  let vernacularExplanation = '';

  // 1. Direct Mule VPA check
  if (extractedUpi && scamDb.knownMuleVpas.includes(extractedUpi)) {
    score += 85;
    reasons.push(`Recipient VPA (${extractedUpi}) matches known inter-bank mule account intelligence.`);
  }

  // 2. Verified Merchant discount
  const verified = scamDb.verifiedMerchants.find(m => m.vpa === extractedUpi);
  if (verified) {
    score = Math.max(2, score - 20);
    reasons.push(`Recipient is a verified merchant (${verified.name}) with ${verified.ageDays} days clean operational track record.`);
  }

  // 3. Pattern Matching from Scam DB
  for (const pattern of scamDb.scamPatterns) {
    let matchCount = 0;
    for (const trigger of pattern.triggers) {
      if (lowerText.includes(trigger)) {
        matchCount++;
      }
    }

    if (matchCount >= 1) {
      score += (pattern.severity === 'CRITICAL' ? 55 : 35);
      reasons.push(`Pattern detected: ${pattern.title}`);
      if (!vernacularExplanation) {
        vernacularExplanation = pattern.explanations[language] || pattern.explanations['en'];
      }
    }
  }

  // 4. Pressure / Urgency indicators
  const urgencyWords = ['immediately', 'within 2 hours', 'urgent', 'tonight', 'warning', 'तुरंत', 'জরুরি'];
  for (const uw of urgencyWords) {
    if (lowerText.includes(uw)) {
      score += 15;
      reasons.push('Coercive pressure / artificial urgency detected.');
      break;
    }
  }

  // Final score clamping
  score = Math.min(100, Math.max(2, score));

  // Determine Verdict
  if (score >= 70) {
    verdict = 'SCAM';
    if (!vernacularExplanation) {
      vernacularExplanation = language === 'hi' 
        ? 'धोखाधड़ी का उच्च जोखिम! इस संदेश में जबरन पैसे मांगने के लक्षण हैं।'
        : language === 'bn'
        ? 'উচ্চ ঝুঁকির প্রতারণা! এই মেসেজে অবৈধ টাকা দাবির লক্ষণ পাওয়া গেছে।'
        : 'High Risk Scam Detected! This request exhibits coercive payment fraud characteristics.';
    }
  } else if (score >= 30) {
    verdict = 'CAUTION';
    if (!vernacularExplanation) {
      vernacularExplanation = language === 'hi'
        ? 'सावधानी बरतें: यह अपुष्ट प्राप्तकर्ता है। पूर्ण सत्यापन के बिना PIN दर्ज न करें।'
        : language === 'bn'
        ? 'সতর্কতা: এটি অপ্রমাণিত প্রাপক। সম্পূর্ণ যাচাই না করে পিন দেবেন না।'
        : 'Proceed with Caution: Recipient is unverified. Never enter your UPI PIN to receive funds.';
    }
  } else {
    verdict = 'SAFE';
    vernacularExplanation = language === 'hi'
      ? 'सत्यापित सुरक्षित: कोई संदिग्ध धोखाधड़ी पैटर्न नहीं पाया गया।'
      : language === 'bn'
      ? 'যাচাইকৃত নিরাপদ: কোনো সন্দেহজনক প্রতারণার প্যাটার্ন পাওয়া যায়নি।'
      : 'Verified Safe: No suspicious scam patterns or flagged accounts detected.';
  }

  const latencyMs = Math.max(10, Date.now() - startTime);

  return {
    score,
    verdict,
    reasons,
    vernacularExplanation,
    extractedUpi,
    latencyMs
  };
}

module.exports = {
  runRuleEngine,
  extractUpi
};
