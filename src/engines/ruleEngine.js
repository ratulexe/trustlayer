// Heuristic Rule Engine (Deterministic, sub-5ms execution, offline-safe)
const { performance } = require('perf_hooks');
const scamDb = require('../data/scamDatabase.json');

const knownMuleSet = new Set(
  (scamDb.knownMuleVpas || []).map((v) => v.toLowerCase().trim())
);
const verifiedMerchants = scamDb.verifiedMerchants || [];
const scamPatterns = scamDb.scamPatterns || [];

// Allow-list of common NPCI UPI handle suffixes to boost confidence
const KNOWN_UPI_HANDLES = new Set([
  'okaxis', 'okhdfcbank', 'oksbi', 'okicici', 'ybl', 'ibl', 'axl',
  'paytm', 'sbi', 'hdfcbank', 'icici', 'axisbank', 'upi', 'apl',
  'barodampay', 'federal', 'pnb', 'idbi', 'kotak', 'postbank', 'indus',
  'yesbank', 'fbl', 'freecharge', 'airtel', 'allbank', 'cnrb', 'boi',
  'unionbank', 'dlb', 'scb', 'aubank', 'jupiteraxis', 'sliceaxis', 'icicibank'
]);

// Multilingual Reasons Dictionary (English, Hindi, Bengali)
const REASONS = {
  MULE_MATCH: {
    en: (upi) => `Recipient VPA (${upi}) matches known inter-bank mule account intelligence.`,
    hi: (upi) => `प्राप्तकर्ता UPI (${upi}) धोखाधड़ी वाले संदिग्ध खातों की सूची में दर्ज है।`,
    bn: (upi) => `প্রাপকের UPI (${upi}) চিহ্নিত প্রতারণামূলক খাতার তালিকায় রয়েছে।`
  },
  VERIFIED_MERCHANT: {
    en: (name, ageDays) => `Recipient is a verified merchant (${name}) with ${ageDays} days clean operational track record.`,
    hi: (name, ageDays) => `प्राप्तकर्ता एक सत्यापित व्यापारी (${name}) है जिसका ${ageDays} दिनों का सुरक्षित रिकॉर्ड है।`,
    bn: (name, ageDays) => `প্রাপক একজন যাচাইকৃত ব্যবসায়ী (${name}), যার ${ageDays} দিনের নিরাপদ লেনদেনের ইতিহাস আছে।`
  },
  PATTERN_DETECTED: {
    en: (title) => `Pattern detected: ${title}`,
    hi: (title) => `धोखाधड़ी का पैटर्न मिला: ${title}`,
    bn: (title) => `প্রতারণার ধরন শনাক্ত হয়েছে: ${title}`
  },
  URGENCY_PRESSURE: {
    en: () => 'Coercive pressure / artificial urgency detected.',
    hi: () => 'दबाव बनाकर तुरंत पैसे मांगने के संकेत मिले हैं।',
    bn: () => 'চাপ সৃষ্টি করে এখনই টাকা চাওয়ার লক্ষণ শনাক্ত হয়েছে।'
  },
  REVERSE_PSYCHOLOGY_UNLOCK: {
    en: () => 'Reverse psychology / advance fee unlock scheme detected.',
    hi: () => 'पैसे या नौकरी का इनाम पाने के लिए पहले पैसे मांगने की चाल पकड़ी गई।',
    bn: () => 'টাকা বা পুরস্কার ছাড়ানোর নামে আগে টাকা জমা দেওয়ার ফাঁদ ধরা পড়েছে।'
  },
  SUSPICIOUS_LINK: {
    en: () => 'Suspicious link or URL shortener detected in the message.',
    hi: () => 'संदेश में संदिग्ध लिंक या संक्षिप्त (शॉर्ट) यूआरएल मिला है।',
    bn: () => 'মেসেজে সন্দেহজনক লিংক বা শর্ট ইউআরএল (URL) পাওয়া গেছে।'
  },
  UNVERIFIED_UPI: {
    en: (upi) => `Recipient (${upi}) is an unverified private VPA.`,
    hi: (upi) => `प्राप्तकर्ता (${upi}) एक असत्यापित निजी UPI खाता है।`,
    bn: (upi) => `প্রাপক (${upi}) একটি অপ্রমাণিত ব্যক্তিগত UPI অ্যাকাউন্ট।`
  }
};

function getReason(key, language = 'en', ...args) {
  const langKey = language === 'hi' || language === 'bn' ? language : 'en';
  const entry = REASONS[key];
  if (!entry) return '';
  const fn = entry[langKey] || entry.en;
  return typeof fn === 'function' ? fn(...args) : '';
}

// Convert Devanagari and Bengali digits to standard Arabic digits (0-9)
function convertIndicDigits(str = '') {
  return str
    .replace(/[\u0966-\u096F]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48))
    .replace(/[\u09E6-\u09EF]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09E6 + 48));
}

// Levenshtein distance function (O(M*N), no external libraries)
function levenshtein(a = '', b = '') {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  let prev = new Array(lb + 1);
  let curr = new Array(lb + 1);

  for (let j = 0; j <= lb; j++) prev[j] = j;

  for (let i = 1; i <= la; i++) {
    curr[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= lb; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost // substitution
      );
    }
    const temp = prev;
    prev = curr;
    curr = temp;
  }

  return prev[lb];
}

/**
 * Extract ALL valid UPI IDs from text, strictly rejecting emails and web domains
 */
function extractAllUpis(text = '') {
  if (!text || typeof text !== 'string') return [];

  // Match tokens containing @: username@handle
  const tokenRegex = /(?:^|[\s,;:(<\["'])?([a-zA-Z0-9.\-_]{2,256}@([a-zA-Z0-9.\-_]+))(?:$|[\s,;:)>\]"'])?/g;
  const validUpis = [];
  const seen = new Set();
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    const fullToken = match[1];
    const clean = fullToken.toLowerCase().trim().replace(/[.,;:!?]+$/, '');
    const atIndex = clean.indexOf('@');
    if (atIndex <= 0) continue;

    const user = clean.slice(0, atIndex);
    const handle = clean.slice(atIndex + 1);

    // Reject emails: if handle has a dot (e.g. gmail.com, company.co.in) -> EMAIL!
    if (handle.includes('.')) continue;

    // Handle must be alphanumeric or hyphen/underscore, 2 to 64 chars
    if (!/^[a-zA-Z0-9_-]{2,64}$/.test(handle)) continue;

    // Username must be valid 2 to 256 chars
    if (!/^[a-zA-Z0-9.\-_]{2,256}$/.test(user)) continue;

    if (!seen.has(clean)) {
      seen.add(clean);
      validUpis.push(clean);
    }
  }

  return validUpis;
}

// Backward-compatible single UPI extractor
function extractUpi(text = '') {
  const upis = extractAllUpis(text);
  return upis.length > 0 ? upis[0] : null;
}

/**
 * Map common look-alikes inside words (0->o, 1->i, 3->e, @->a, $->s)
 * Preserves standalone numeric values like ₹25000, 50k, 2000
 */
function mapLookalikes(str = '') {
  return str
    .replace(/(?<=[a-zA-Z])0(?=[a-zA-Z])/g, 'o')
    .replace(/(?<=[a-zA-Z])1(?=[a-zA-Z])/g, 'i')
    .replace(/(?<=[a-zA-Z])3(?=[a-zA-Z])/g, 'e')
    .replace(/\b0([a-zA-Z]{2,})\b/g, 'o$1')
    .replace(/\b1([a-zA-Z]{2,})\b/g, 'i$1')
    .replace(/\b3([a-zA-Z]{2,})\b/g, 'e$1')
    .replace(/\b([a-zA-Z]{2,})0\b/g, '$1o')
    .replace(/\b([a-zA-Z]{2,})1\b/g, '$1i')
    .replace(/\b([a-zA-Z]{2,})3\b/g, '$1e')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's');
}

/**
 * Normalize text for resilient scam trigger matching
 */
function normalize(rawText = '', extractedUpis = []) {
  if (!rawText || typeof rawText !== 'string') return '';

  // 1. Unicode NFKC
  let text = rawText.normalize('NFKC');

  // 2. Convert Devanagari and Bengali digits to standard Arabic digits (0-9)
  text = convertIndicDigits(text);

  // 3. Lowercase
  text = text.toLowerCase();

  // Protect extracted UPI IDs so @ and internal characters are not distorted
  const upiPlaceholders = [];
  extractedUpis.forEach((upi, idx) => {
    const placeholder = String.fromCharCode(0xE000 + idx);
    upiPlaceholders.push({ placeholder, upi });
    text = text.split(upi.toLowerCase()).join(placeholder);
  });

  // 4. Remove dots/dashes/spaces inside short acronym tokens: "k.y.c", "k y c", "k-y-c", "k. y. c" -> "kyc"
  text = text.replace(/(?<=\b[a-z0-9])[\s.\-_]+(?=[a-z0-9](?:[\s.\-_]+[a-z0-9])*\b)/gi, '');

  // 5. Map look-alikes inside words
  text = mapLookalikes(text);

  // 6. Collapse repeated letters ("urgenttt" -> "urgent")
  text = text.replace(/(.)\1{2,}/gu, '$1');

  // Restore protected UPI IDs
  upiPlaceholders.forEach(({ placeholder, upi }) => {
    text = text.split(placeholder).join(upi);
  });

  return text;
}

/**
 * Detect suspicious shorteners and bank/government impersonation URLs
 * Excludes extracted UPI IDs so valid merchant handles (e.g. wbsedcl.online@sbi) are never flagged
 */
function detectSuspiciousLinks(text = '', extractedUpis = []) {
  let cleanText = text.toLowerCase();
  for (const upi of extractedUpis) {
    cleanText = cleanText.split(upi.toLowerCase()).join(' ');
  }

  // 1. Common URL shorteners
  const shortenerPattern = /\b(?:bit\.ly|tinyurl(?:\.com)?|t\.ly|cutt\.ly|is\.gd|shorturl\.at|rb\.gy)\/[a-zA-Z0-9_\-]+/i;
  if (shortenerPattern.test(cleanText)) return true;

  // 2. Hyphenated bank / government / scam update domains
  const deceptiveKeywordPattern = /\b(?:sbi-kyc|trai-verify|yono-update|pan-update|bank-verify|discom-bill|ebill-pay|cbi-case|police-notice)[a-zA-Z0-9.\-_]*/i;
  if (deceptiveKeywordPattern.test(cleanText)) return true;

  // 3. Suspicious TLDs with banking/government terms
  const suspiciousTldPattern = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)*(?:sbi|bank|kyc|trai|yono|discom|wbsedcl|post|customs|police|cbi|rbi)[a-zA-Z0-9-]*\.(?:xyz|top|click|live|club|info|online|site)(?:\/[^\s]*)?/i;
  if (suspiciousTldPattern.test(cleanText)) return true;

  return false;
}

// Negation right before a trigger ("do not share your otp", "never share the otp")
const NEGATION_BEFORE = /(?:\bnot|\bnever|\bdon'?t|\bdont|\bdo not|\bnahi|\bnahin|\bmat|\bna|नहीं|न|মত)\s*$/u;
const NEGATION_BEFORE_NOSPACE = /(?:not|never|don'?t|dont)$/u;

// Hindi / Hinglish / Bengali often negate after the verb ("otp batana nahi hai", "otp bolben na")
const NEGATION_AFTER = /^\S*\s+(?:mat|nahi|nahin|na|नहीं|मत|না)(?:\s|$|[.,!])/u;

/** true if `needle` occurs in `haystack` at least once without a negation just before (or after) it */
function hasUnnegated(haystack, needle, negationRegex) {
  if (!needle) return false;
  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) return false;
    const before = haystack.slice(Math.max(0, idx - 14), idx);
    const after = haystack.slice(idx + needle.length, idx + needle.length + 16);
    if (!negationRegex.test(before) && !NEGATION_AFTER.test(after)) return true;
    from = idx + 1;
  }
}

function runRuleEngine({ rawInput = '', language = 'en' }) {
  const startTime = performance.now();
  const rawString = String(rawInput || '');

  // Step 1: Extract all valid UPI IDs (rejects emails like help@gmail.com)
  const extractedUpis = extractAllUpis(rawString);

  // Step 2: Normalize text for matching
  const normalizedText = normalize(rawString, extractedUpis);
  const normalizedNoSpaces = normalizedText.replace(/\s+/g, '');
  const words = normalizedText.split(/[\s,.;:!?/\\|()[\]{}<>"'`~#*+=_-]+/).filter(Boolean);

  let score = 5;
  const reasons = [];
  let verdict = 'SAFE';
  let vernacularExplanation = '';

  // Step 3: Score by the riskiest UPI ID
  let riskiestUpi = null;
  const muleMatch = extractedUpis.find((upi) => knownMuleSet.has(upi));

  if (muleMatch) {
    score += 85;
    riskiestUpi = muleMatch;
    reasons.push(getReason('MULE_MATCH', language, muleMatch));
  } else if (extractedUpis.length > 0) {
    // Check if ALL extracted UPI IDs are verified merchants
    const allVerified = extractedUpis.every((upi) =>
      verifiedMerchants.some((m) => m.vpa === upi)
    );

    if (allVerified) {
      score = Math.max(2, score - 20);
      const merchant = verifiedMerchants.find((m) => m.vpa === extractedUpis[0]);
      riskiestUpi = extractedUpis[0];
      reasons.push(
        getReason('VERIFIED_MERCHANT', language, merchant.name, merchant.ageDays)
      );
    } else {
      // Find the first unverified VPA as the riskiest
      riskiestUpi = extractedUpis.find((upi) => !verifiedMerchants.some((m) => m.vpa === upi)) || extractedUpis[0];
    }
  }

  // Step 4: Pattern Matching from Scam DB (with tolerant single-word Levenshtein matching)
  for (const pattern of scamPatterns) {
    let matched = false;

    for (const trigger of pattern.triggers || []) {
      const lowerTrigger = trigger.toLowerCase();
      const triggerNoSpaces = lowerTrigger.replace(/\s+/g, '');

      // Direct substring match on normalized text or space-stripped text.
      // "negatable" patterns ignore a trigger that follows "do not / never / don't",
      // so genuine bank SMS like "Do not share your OTP" are not flagged.
      // When the spaced text contains the trigger it decides (it can see negation after the
      // verb, e.g. "otp batana nahi hai"); the space-stripped text is only a fallback for
      // obfuscated spacing.
      const directMatch = pattern.negatable
        ? normalizedText.includes(lowerTrigger)
          ? hasUnnegated(normalizedText, lowerTrigger, NEGATION_BEFORE)
          : hasUnnegated(normalizedNoSpaces, triggerNoSpaces, NEGATION_BEFORE_NOSPACE)
        : normalizedText.includes(lowerTrigger) || normalizedNoSpaces.includes(triggerNoSpaces);
      if (directMatch) {
        matched = true;
        break;
      }

      // Tolerant matching for single-word triggers >= 6 letters (edit distance <= 1)
      if (lowerTrigger.length >= 6 && !lowerTrigger.includes(' ')) {
        for (const word of words) {
          if (Math.abs(word.length - lowerTrigger.length) <= 1) {
            if (levenshtein(word, lowerTrigger) <= 1) {
              matched = true;
              break;
            }
          }
        }
        if (matched) break;
      }
    }

    if (matched) {
      score += pattern.severity === 'CRITICAL' ? 70 : 35;
      const patternTitle =
        (pattern.titles && pattern.titles[language]) ||
        pattern.title ||
        pattern.id;
      reasons.push(getReason('PATTERN_DETECTED', language, patternTitle));

      if (!vernacularExplanation && pattern.explanations) {
        vernacularExplanation =
          pattern.explanations[language] || pattern.explanations.en || '';
      }
    }
  }

  // Step 5: Pressure / Urgency indicators (Multilingual + Hinglish)
  const urgencyWords = [
    'immediately',
    'within 2 hours',
    'urgent',
    'tonight',
    'warning',
    'last chance',
    'turant',
    'तुरंत',
    'জরুরি',
    'জরুরী',
    'এখনই',
    'ekhon-i',
    'jaldi'
  ];
  for (const uw of urgencyWords) {
    if (normalizedText.includes(uw) || normalizedNoSpaces.includes(uw)) {
      score += 15;
      reasons.push(getReason('URGENCY_PRESSURE', language));
      break;
    }
  }

  // Step 6: Sarcasm / Disguised Reverse-Psychology Coercion & Prepaid Unlock Trap (+45)
  const hasUnlock =
    normalizedText.includes('unlock') ||
    normalizedText.includes('release') ||
    normalizedText.includes('claim');
  const hasBonus =
    normalizedText.includes('bonus') ||
    normalizedText.includes('salary') ||
    normalizedText.includes('income') ||
    normalizedText.includes('commission');
  const hasPrepay =
    normalizedText.includes('send') ||
    normalizedText.includes('transfer') ||
    normalizedText.includes('pay') ||
    normalizedText.includes('deposit') ||
    normalizedText.includes('fee');
  const hasNoHurryOrReverse =
    normalizedText.includes('no hurry') ||
    normalizedText.includes('tension mat') ||
    normalizedText.includes('kono chap') ||
    normalizedText.includes('just send');

  if ((hasUnlock && hasPrepay) || (hasBonus && hasPrepay && hasNoHurryOrReverse)) {
    score += 45;
    reasons.push(getReason('REVERSE_PSYCHOLOGY_UNLOCK', language));
  }

  // Step 7: Suspicious Links & URL Shorteners (+25)
  if (detectSuspiciousLinks(rawString, extractedUpis)) {
    score += 25;
    reasons.push(getReason('SUSPICIOUS_LINK', language));
  }

  // Step 8: Final score clamping
  score = Math.min(100, Math.max(2, score));

  // Step 9: Determine Verdict
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
          ? 'সতর্কতা: এটি অপ্রমাণित প্রাপক। সম্পূর্ণ যাচাই না করে পিন দেবেন না।'
          : 'Proceed with Caution: Recipient is unverified. Never enter your UPI PIN to receive funds.';
    }
  } else {
    verdict = 'SAFE';
    if (!vernacularExplanation) {
      vernacularExplanation =
        language === 'hi'
          ? 'सत्यापित सुरक्षित: कोई संदिग्ध धोखाधड़ी पैटर्न नहीं पाया गया।'
          : language === 'bn'
          ? 'যাচাইকৃত নিরাপদ: কোনো संदेहजनक প্রতারণার প্যাটার্ন পাওয়া যায়নি।'
          : 'Verified Safe: No suspicious scam patterns or flagged accounts detected.';
    }
  }

  const latencyMs = Number((performance.now() - startTime).toFixed(2));

  return {
    score,
    verdict,
    reasons,
    vernacularExplanation,
    extractedUpi: riskiestUpi,
    extractedUpis,
    heuristicLatencyMs: latencyMs,
    latencyMs
  };
}

module.exports = {
  runRuleEngine,
  extractUpi,
  extractAllUpis,
  normalize,
  levenshtein,
  KNOWN_UPI_HANDLES,
  REASONS
};
