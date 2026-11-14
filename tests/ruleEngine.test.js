// tests/ruleEngine.test.js — Automated offline test suite for TrustLayer Threat Shield
const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  runRuleEngine,
  extractUpi,
  extractAllUpis,
  normalize,
  levenshtein
} = require('../src/engines/ruleEngine');

describe('TrustLayer Rule Engine & Threat Shield Test Suite', () => {
  // Test suite accuracy tracker
  let totalTests = 0;
  let correctPredictions = 0;
  let falsePositives = 0; // Classified as SCAM when expected SAFE/CAUTION
  let falseNegatives = 0; // Classified as SAFE/CAUTION when expected SCAM

  const benchmarkCases = [
    // ----------------------------------------------------
    // SCAM CASES (Expected: SCAM, Score >= 70) — 22 cases
    // ----------------------------------------------------
    {
      name: 'Misspelled electricity & disconnected with mule VPA',
      input: 'Dear consumer your electricty will be disconected tonight pay to powerbill@okaxis',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'K.Y.C with dots and account band threat',
      input: 'Your K.Y.C is pending, update now or account band ho jayega: sbi-kyc-desk@ybl',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'Spaced k y c update with TRAI suspension',
      input: 'Alert: k y c update urgently or mobile number suspended, contact trai-verify@okicici',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Hyphenated k-y-c expiry alert with mule',
      input: 'Notice: k-y-c expiry alert, account freeze warning immediately pay to kyc-update99@okaxis',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Bengali Electricity disconnection tonight',
      input: 'বিদ্যুৎ বিল বাকি আছে, আজ রাতেই লাইন কাটা হবে, এখনই টাকা পাঠান wbsedcl-billpay@axl',
      lang: 'bn',
      expected: 'SCAM'
    },
    {
      name: 'Hindi Electricity cutoff ultimatum',
      input: 'बिजली बिल तुरंत जमा करें वरना रात 9.30 बजे बिजली काट दी जाएगी bijlibill.update@ybl',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'Telegram prepaid task scam (en)',
      input: 'Earn daily income ₹3000! Join Telegram part-time job, complete prepaid task now.',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Telegram prepaid task scam (hi)',
      input: 'घर बैठे कमाएं! टेलीग्राम पर पार्ट-टाइम काम करके रोज 3000 कमाएं tg-task-payout@ibl',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'Telegram part time prepaid task (bn)',
      input: 'টেলিগ্রামে পার্ট টাইম কাজ করে ঘরে বসে আয় করুন, এখনই প্রিপেইড টাস্ক করুন',
      lang: 'bn',
      expected: 'SCAM'
    },
    {
      name: 'India Post customs parcel held (en)',
      input: 'India Post: Your international parcel held at customs. Pay customs duty clearance fee immediately to customs-india-duty@oksbi',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'India Post customs parcel held (hi)',
      input: 'इंडिया पोस्ट: आपका पार्सल कस्टम्स में अटका है, क्लीयरेंस फीस तुरंत जमा करें',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'India Post customs parcel held (bn)',
      input: 'ইন্ডিয়া পোস্ট: আপনার পার্সেল আটকে গেছে, অবিলম্বে কাস্টমস ডিউটি ফি প্রদান করুন',
      lang: 'bn',
      expected: 'SCAM'
    },
    {
      name: 'Instant loan upfront processing fee (en)',
      input: 'Pre-approved instant loan of ₹5,00,000! Pay ₹2,500 processing fee to fastloan.disbursal@okaxis',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Instant loan upfront fee (hi)',
      input: 'बिना पेपर तुरंत 2 लाख का लोन स्वीकृत! अग्रिम लोन प्रोसेसिंग फीस तुरंत जमा करें',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'Guaranteed investment doubling scheme (en)',
      input: 'Guaranteed returns! Double your money in 7 days with our VIP crypto investment crypto-profit-daily@ibl',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Money doubling scheme (hi)',
      input: 'पैसा डबल स्कीम! 10 दिन में पैसे दोगुना करने की गारंटी, आज ही निवेश करें',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'Digital arrest CBI extortion (en)',
      input: 'CBI Officer: Money laundering case registered against you. Digital arrest warrant issued, stay on video call cbi-cybercell.gov@oksbi',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Digital arrest extortion (bn)',
      input: 'সিবিআই নোটিশ: আপনার নামে ডিজিটাল অ্যারেস্ট ওয়ারেন্ট জারি হয়েছে, অবিলম্বে যোগাযোগ করুন',
      lang: 'bn',
      expected: 'SCAM'
    },
    {
      name: 'Reverse UPI PIN refund trap (en)',
      input: 'Refund initiated from GPay! Enter your UPI PIN to receive ₹4,500 refund into your bank account',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Cashback reverse collect trap (hi)',
      input: 'बधाई! ₹2500 कैशबैक पाने के लिए अपना UPI पिन डालें और क्लेम करें refund-desk77@ybl',
      lang: 'hi',
      expected: 'SCAM'
    },
    {
      name: 'Subtle Hinglish reverse psychology coercion (en)',
      input: 'No hurry bro, just send ₹2000 first to unlock your ₹50k job bonus',
      lang: 'en',
      expected: 'SCAM'
    },
    {
      name: 'Known mule VPA blacklist match directly',
      input: 'Please transfer ₹12,500 immediately to lottery_reward99@okhdfc',
      lang: 'en',
      expected: 'SCAM'
    },

    // ----------------------------------------------------
    // CAUTION CASES (Expected: CAUTION, 30 <= Score < 70) — 11 cases
    // ----------------------------------------------------
    {
      name: 'Casual parcel release request with unverified VPA',
      input: 'Bhai please send 2000 to release my parcel, pay to ravi.kumar@ybl',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Membership unlock request with prepay',
      input: 'Please transfer 500 to unlock your membership card at club desk',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Warehouse package release deposit',
      input: 'Pay ₹100 deposit to release your package at local storage counter',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Gift voucher claim fee',
      input: 'Send ₹200 fee to claim your gift voucher at the festival kiosk',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Trial access unlock fee',
      input: 'Deposit 300 to unlock the software trial access for this week',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Shortlink photo gallery (bit.ly)',
      input: 'Check the new photo album from our trip at bit.ly/vacation-album-2026',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Shortlink party invite (tinyurl)',
      input: 'View the event venue details at tinyurl.com/birthday-invite for timing',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Shortlink document guide (is.gd)',
      input: 'Read the conference guidelines at is.gd/event-details-doc before coming',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Shortlink wedding RSVP (cutt.ly)',
      input: 'RSVP to our wedding ceremony at cutt.ly/wedding-ceremony today',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Shortlink exam schedule with urgency',
      input: 'Important notice: please check bit.ly/school-exam-schedule immediately',
      lang: 'en',
      expected: 'CAUTION'
    },
    {
      name: 'Shortlink safety instructions with warning',
      input: 'Warning: check the safety instructions at t.ly/office-security for drills',
      lang: 'en',
      expected: 'CAUTION'
    },

    // ----------------------------------------------------
    // SAFE CASES (Expected: SAFE, Score < 30) — 22 cases
    // ----------------------------------------------------
    {
      name: 'Verified Merchant Sharma Groceries',
      input: 'Payment for weekly household groceries at Sharma Store. Pay ₹350 to grocer@okaxis',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Verified Merchant FreshMart Kolkata',
      input: 'Paid ₹620 to freshmart.kolkata@icici at checkout counter',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Verified Merchant Apollo Pharmacy',
      input: 'Medicine bill payment of ₹1450 to apollo.pharmacy@hdfcbank',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Verified Merchant WBSEDCL Official Bill Desk',
      input: 'Official electricity bill payment receipt wbsedcl.online@sbi',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Verified Merchant Ramu Tea Stall',
      input: 'Chai and samosa payment ₹40 to ramu.tea@upi',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Verified Merchant Metro Transit',
      input: 'Metro card recharge ₹200 to metro.transit@sbi',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Customer support email only (no false positive)',
      input: 'Contact us at help@gmail.com for your order support',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Corporate email address in text',
      input: 'Email me at user@company.co.in or support@amazon.in for query',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Government info email only',
      input: 'Reach the desk at info@customs.gov.in for public inquiries',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Legitimate bank notification without payment request',
      input: 'Your A/C XX1234 is credited with INR 5,000 on 14-Nov-26 via NEFT from ABC Corp. Bal: INR 24,500. Call 1800112211 if not you.',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Dinner split to unverified private VPA (normal peer payment)',
      input: 'Paying for yesterday dinner, send ₹400 to amit.sharma@paytm',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Friend book transfer (normal peer payment)',
      input: 'Bhai, sending ₹500 for the books to rahul99@okhdfcbank',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Plumber home service charges (normal peer payment)',
      input: 'Plumber service charges ₹650 payable to suresh.services@ybl',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'College books purchase (normal peer payment)',
      input: 'Buying college books from classmate, transferring ₹800 to priya.sen@okaxis',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Hindi peer auto fare (normal peer payment)',
      input: 'कल के ऑटो किराए के ₹120 भेज रहा हूँ rohit.kumar@upi पर',
      lang: 'hi',
      expected: 'SAFE'
    },
    {
      name: 'Bengali peer tea split (normal peer payment)',
      input: 'ভাই কালকের চা-নাস্তার ১৫০ টাকা পাঠাচ্ছি subhash.das@okicici তে',
      lang: 'bn',
      expected: 'SAFE'
    },
    {
      name: 'Chat message from Mom in Hindi',
      input: 'बेटा घर कब आओगे? रास्ते से दूध और ब्रेड ले आना।',
      lang: 'hi',
      expected: 'SAFE'
    },
    {
      name: 'Chat message from family in Bengali',
      input: 'মা বলল আজ রাতে বাড়ি ফেরার সময় ফল নিয়ে আসতে। সাবধানে এসো।',
      lang: 'bn',
      expected: 'SAFE'
    },
    {
      name: 'Work meeting schedule reminder',
      input: 'Team standup is scheduled today at 4:00 PM on Google Meet. Please be on time.',
      lang: 'en',
      expected: 'SAFE'
    },
    {
      name: 'Devanagari digits with verified grocer',
      input: 'Pay ₹२५०० to grocer@okaxis for monthly ration',
      lang: 'hi',
      expected: 'SAFE'
    },
    {
      name: 'Bengali digits with verified grocer',
      input: 'মুদির দোকানের বিল ₹৫০০ দেওয়া হলো grocer@okaxis এ',
      lang: 'bn',
      expected: 'SAFE'
    },
    {
      name: 'Doctor clinic appointment confirmation',
      input: 'Your appointment with Dr. Mukherjee is confirmed for tomorrow 11 AM at City Clinic.',
      lang: 'en',
      expected: 'SAFE'
    }
  ];

  for (const tc of benchmarkCases) {
    test(`[Benchmark] ${tc.name} -> Expected ${tc.expected}`, () => {
      totalTests++;
      const res = runRuleEngine({ rawInput: tc.input, language: tc.lang });

      if (res.verdict === tc.expected) {
        correctPredictions++;
      } else {
        if (tc.expected === 'SAFE' && res.verdict === 'SCAM') {
          falsePositives++;
        } else if (tc.expected === 'SCAM' && res.verdict !== 'SCAM') {
          falseNegatives++;
        }
      }

      assert.strictEqual(
        res.verdict,
        tc.expected,
        `Failed for input: "${tc.input}". Got score ${res.score} (${res.verdict}), expected ${tc.expected}. Reasons: ${JSON.stringify(res.reasons)}`
      );
    });
  }

  // ----------------------------------------------------
  // UNIT TESTS: UPI EXTRACTION & EMAIL REJECTION
  // ----------------------------------------------------
  test('extractAllUpis: rejects emails and extracts genuine UPI IDs', () => {
    const text = 'Reach help@gmail.com, user@company.co.in or pay to ravi.kumar@ybl and backup grocer@okaxis';
    const upis = extractAllUpis(text);
    assert.deepStrictEqual(upis, ['ravi.kumar@ybl', 'grocer@okaxis']);
    assert.strictEqual(extractUpi(text), 'ravi.kumar@ybl');
  });

  test('extractAllUpis: returns empty array when only emails exist', () => {
    const text = 'Email us at support@amazon.in or info@customs.gov.in';
    const upis = extractAllUpis(text);
    assert.deepStrictEqual(upis, []);
    assert.strictEqual(extractUpi(text), null);
  });

  test('extractAllUpis: selects riskiest UPI ID when mule and merchant coexist', () => {
    const text = 'Pay grocer@okaxis or transfer to kyc-update99@okaxis';
    const res = runRuleEngine({ rawInput: text, language: 'en' });
    assert.strictEqual(res.extractedUpi, 'kyc-update99@okaxis');
    assert.deepStrictEqual(res.extractedUpis, ['grocer@okaxis', 'kyc-update99@okaxis']);
    assert.strictEqual(res.verdict, 'SCAM');
    assert.strictEqual(res.score >= 70, true);
  });

  // ----------------------------------------------------
  // UNIT TESTS: NORMALIZATION & LEVENSHTEIN
  // ----------------------------------------------------
  test('normalize: converts Devanagari and Bengali digits to 0-9', () => {
    const norm = normalize('Pay ₹२५००० এবং ₹৫০');
    assert.match(norm, /250/);
    assert.match(norm, /50/);
  });

  test('normalize: collapses dots, spaces, dashes in acronyms (K.Y.C -> kyc)', () => {
    assert.match(normalize('Your K.Y.C is pending'), /\bkyc\b/);
    assert.match(normalize('k y c update'), /\bkyc\b/);
    assert.match(normalize('k-y-c status'), /\bkyc\b/);
    assert.match(normalize('c.b.i inquiry'), /\bcbi\b/);
  });

  test('normalize: maps look-alikes inside words while preserving UPI IDs', () => {
    const norm = normalize('urg3nttt! $cam alert: l0ttery winner! c@sh prize to grocer@okaxis', ['grocer@okaxis']);
    assert.match(norm, /urgent/);
    assert.match(norm, /scam/);
    assert.match(norm, /lottery/);
    assert.match(norm, /cash/);
    assert.match(norm, /grocer@okaxis/);
  });

  test('levenshtein: correctly measures edit distances', () => {
    assert.strictEqual(levenshtein('electricty', 'electricity'), 1);
    assert.strictEqual(levenshtein('disconected', 'disconnected'), 1);
    assert.strictEqual(levenshtein('telegram', 'telegram'), 0);
  });

  // ----------------------------------------------------
  // UNIT TESTS: VERNACULAR REASONS TRANSLATION
  // ----------------------------------------------------
  test('reasons are translated into Hindi when requested', () => {
    const res = runRuleEngine({
      rawInput: 'TRAI alert: Your SIM deactivated today. Urgent kyc-update99@okaxis',
      language: 'hi'
    });
    assert.strictEqual(res.verdict, 'SCAM');
    const reasonsStr = res.reasons.join(' ');
    assert.match(reasonsStr, /धोखाधड़ी|सूची|दबाव/);
    assert.match(res.vernacularExplanation, /TRAI/);
  });

  test('reasons are translated into Bengali when requested', () => {
    const res = runRuleEngine({
      rawInput: 'TRAI alert: Your SIM deactivated today. Urgent kyc-update99@okaxis',
      language: 'bn'
    });
    assert.strictEqual(res.verdict, 'SCAM');
    const reasonsStr = res.reasons.join(' ');
    assert.match(reasonsStr, /তালিকা|প্রতারণা|চাপ/);
    assert.match(res.vernacularExplanation, /TRAI/);
  });

  // ----------------------------------------------------
  // PERFORMANCE BENCHMARK: SUB-5MS ON 2,000 CHARACTERS
  // ----------------------------------------------------
  test('performance: execution latency on 2,000-character payload is < 5ms', () => {
    const baseText = 'Dear customer, your electricity power connection will be disconnected tonight at 9.30 PM. Please immediately pay pending electricity bill to powerbill@okaxis. Contact customer care support. ';
    const longPayload = baseText.repeat(Math.ceil(2000 / baseText.length)).slice(0, 2000);

    const start = performance.now();
    const res = runRuleEngine({ rawInput: longPayload, language: 'en' });
    const elapsedMs = performance.now() - start;

    console.log(`\n  [LATENCY BENCHMARK] 2,000 chars processed in: ${elapsedMs.toFixed(3)} ms (Reported engine latency: ${res.latencyMs} ms)`);
    assert.strictEqual(elapsedMs < 5.0, true, `Latency ${elapsedMs} ms exceeded 5.0 ms threshold`);
    assert.strictEqual(res.verdict, 'SCAM');
  });

  // ----------------------------------------------------
  // PRINT ACCURACY SUMMARY
  // ----------------------------------------------------
  test('print final accuracy summary', () => {
    const accuracyPct = ((correctPredictions / totalTests) * 100).toFixed(1);
    console.log('\n======================================================');
    console.log('             THREAT SHIELD ACCURACY REPORT            ');
    console.log('======================================================');
    console.log(`  Total Benchmark Cases Tested : ${totalTests}`);
    console.log(`  Correctly Predicted          : ${correctPredictions}`);
    console.log(`  Accuracy Rate                : ${accuracyPct}%`);
    console.log(`  False Positives              : ${falsePositives}`);
    console.log(`  False Negatives              : ${falseNegatives}`);
    console.log('======================================================\n');

    assert.strictEqual(falsePositives, 0, 'No false positives allowed');
    assert.strictEqual(falseNegatives, 0, 'No false negatives allowed');
    assert.strictEqual(correctPredictions, totalTests, 'All test cases must pass');
  });
});

// ----------------------------------------------------------------------------
// OTP / PIN sharing fraud — scams must be caught, genuine bank OTP SMS must not
// ----------------------------------------------------------------------------
describe('OTP / PIN sharing fraud pattern (negation-aware)', () => {
  const scams = [
    ['en', 'I am from your bank. Share the OTP you just received to stop your account being blocked.'],
    ['en', 'Sir galti se OTP aapke number pe chala gaya, please OTP bata do'],
    ['hi', 'Main SBI se bol raha hoon, aapka card band ho jayega, OTP batao jaldi'],
    ['hi', 'Aapko OTP batana hai warna account block'],
    ['hi', 'आपके फोन पर आया OTP बताएं ताकि KYC पूरा हो सके'],
    ['bn', 'আপনার ফোনে আসা ওটিপি বলুন, না হলে অ্যাকাউন্ট বন্ধ হবে'],
    ['en', 'To receive your refund please tell me your UPI PIN'],
    ['en', 'Please read out the 6 digit code you just received on SMS'],
    ['en', 'Kindly share your CVV and card number for verification'],
    ['en', 'pls s h a r e the O.T.P you got']
  ];
  const genuine = [
    ['en', '123456 is your OTP for login. Do not share it with anyone. -SBI'],
    ['en', 'Your OTP is 482913. Never share your OTP with anyone, including bank staff.'],
    ['en', 'OTP for txn of Rs 450 at Amazon is 771203. Do not share your OTP with anyone. - HDFC Bank'],
    ['hi', 'Aapka OTP 552190 hai. Kisi ke saath OTP share na karein.'],
    ['hi', 'आपका OTP 552190 है। इसे किसी को न बताएं।'],
    ['bn', 'আপনার OTP 552190। এটি কাউকে বলবেন না।'],
    ['hi', 'Bank kabhi OTP nahi maangta, OTP batana nahi hai kisi ko'],
    ['en', 'Dont share your OTP or UPI PIN with anyone. Stay safe']
  ];

  for (const [lang, input] of scams) {
    test(`flags OTP/PIN request as SCAM: "${input.slice(0, 50)}"`, () => {
      const r = runRuleEngine({ rawInput: input, language: lang });
      assert.strictEqual(r.verdict, 'SCAM', `score ${r.score}`);
    });
  }

  for (const [lang, input] of genuine) {
    test(`does not flag genuine OTP SMS: "${input.slice(0, 50)}"`, () => {
      const r = runRuleEngine({ rawInput: input, language: lang });
      assert.notStrictEqual(r.verdict, 'SCAM', `score ${r.score}`);
    });
  }

  test('explains the OTP scam in the user language', () => {
    const r = runRuleEngine({ rawInput: 'OTP batao jaldi', language: 'hi' });
    assert.match(r.vernacularExplanation, /OTP/);
    assert.match(r.vernacularExplanation, /[ऀ-ॿ]/); // Devanagari
  });
});
