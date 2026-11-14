// Heuristic Rule Engine (Deterministic, sub-20ms execution)
const { performance } = require('perf_hooks');
const scamDb = require('../data/scamDatabase.json');

const knownMuleSet = new Set(
  (scamDb.knownMuleVpas || []).map((v) => v.toLowerCase().trim())
);
const verifiedMerchants = scamDb.verifiedMerchants || [];
const scamPatterns = scamDb.scamPatterns || [];

function extractUpi(text = '') {
  const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g;
  const matches = text.match(upiRegex);
  return matches ? matches[0].toLowerCase() : null;
}

function runRuleEngine({ rawInput = '', language = 'en' }) {
  const startTime = performance.now();
  const lowerText = String(rawInput).toLowerCase();
  const extractedUpi = extractUpi(rawInput);

  let score = 5;
  const reasons = [];
  let verdict = 'SAFE';
  let vernacularExplanation = '';

  // 1. Direct Mule VPA check (O(1) Set lookup)
  if (extractedUpi && knownMuleSet.has(extractedUpi)) {
    score += 85;
    reasons.push(
      `Recipient VPA (${extractedUpi}) matches known inter-bank mule account intelligence.`
    );
  }

  // 2. Verified Merchant discount
  const verified = verifiedMerchants.find((m) => m.vpa === extractedUpi);
  if (verified) {
    score = Math.max(2, score - 20);
    reasons.push(
      `Recipient is a verified merchant (${verified.name}) with ${verified.ageDays} days clean operational track record.`
    );
  }

  // 3. Pattern Matching from Scam DB
  for (const pattern of scamPatterns) {
    const matched = (pattern.triggers || []).some((trigger) =>
      lowerText.includes(trigger.toLowerCase())
    );

    if (matched) {
      score += pattern.severity === 'CRITICAL' ? 70 : 35;
      reasons.push(`Pattern detected: ${pattern.title}`);
      if (!vernacularExplanation && pattern.explanations) {
        vernacularExplanation =
          pattern.explanations[language] || pattern.explanations.en || '';
      }
    }
  }

  // 4. Pressure / Urgency indicators
  const urgencyWords = [
    'immediately',
    'within 2 hours',
    'urgent',
    'tonight',
    'warning',
    'last chance',
    'तुरंत',
    'জরুরি',
    'জরুরী'
  ];
  for (const uw of urgencyWords) {
    if (lowerText.includes(uw)) {
      score += 15;
      reasons.push('Coercive pressure / artificial urgency detected.');
      break;
    }
  }

  // 5. Sarcasm / Disguised Reverse-Psychology Coercion & Prepaid Unlock Trap
  const hasUnlock = lowerText.includes('unlock') || lowerText.includes('release');
  const hasBonus = lowerText.includes('bonus') || lowerText.includes('salary') || lowerText.includes('income');
  const hasPrepay = lowerText.includes('send') || lowerText.includes('transfer') || lowerText.includes('pay') || lowerText.includes('deposit') || lowerText.includes('fee');
  const hasNoHurryOrReverse = lowerText.includes('no hurry') || lowerText.includes('tension mat') || lowerText.includes('kono chap') || lowerText.includes('just send');

  if ((hasUnlock && hasPrepay) || (hasBonus && hasPrepay && hasNoHurryOrReverse)) {
    score += 45;
    reasons.push('Reverse psychology / advance fee unlock scheme detected.');
  }

  // Final score clamping
  score = Math.min(100, Math.max(2, score));

  // Determine Verdict
  if (score >= 70) {
    verdict = 'SCAM';
    if (!vernacularExplanation) {
      vernacularExplanation =
        language === 'hi'
          ? 'धोखाधड़ी का उच्च जोखिम! इस संदेश में जबरन पैसे मांगने के लक्षण हैं।'
          : language === 'bn'
          ? 'উচ্চ ঝুঁকির প্রতারণা! এই মেসেজে অবৈধ টাকা দাবির লক্ষণ পাওয়া গেছে।'
          : 'High Risk Scam Detected! This request exhibits coercive payment fraud characteristics.';
    }
  } else if (score >= 30) {
    verdict = 'CAUTION';
    if (!vernacularExplanation) {
      vernacularExplanation =
        language === 'hi'
          ? 'सावधानी बरतें: यह अपुष्ट प्राप्तकर्ता है। पूर्ण सत्यापन के बिना PIN दर्ज न करें।'
          : language === 'bn'
          ? 'সতর্কতা: এটি অপ্রমাণিত প্রাপক। সম্পূর্ণ যাচাই না করে পিন দেবেন না।'
          : 'Proceed with Caution: Recipient is unverified. Never enter your UPI PIN to receive funds.';
    }
  } else {
    verdict = 'SAFE';
    if (!vernacularExplanation) {
      vernacularExplanation =
        language === 'hi'
          ? 'सत्यापित सुरक्षित: कोई संदिग्ध धोखाधड़ी पैटर्न नहीं पाया गया।'
          : language === 'bn'
          ? 'যাচাইকৃত নিরাপদ: কোনো সন্দেহজনক প্রতারণার প্যাটার্ন পাওয়া যায়নি।'
          : 'Verified Safe: No suspicious scam patterns or flagged accounts detected.';
    }
  }

  const latencyMs = Number((performance.now() - startTime).toFixed(2));

  return {
    score,
    verdict,
    reasons,
    vernacularExplanation,
    extractedUpi,
    heuristicLatencyMs: latencyMs,
    latencyMs
  };
}

module.exports = {
  runRuleEngine,
  extractUpi
};
