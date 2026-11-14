import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const DICTIONARY = {
  en: {
    brandTag: "Zero-Trust UPI Scam Guard",
    navCheck: "Scam Check",
    navPay: "Safe Pay",
    navDashboard: "Threat Feed",
    navInclusion: "Financial Inclusion",
    
    // Check Screen
    checkTitle: "Check Any Message or UPI ID",
    checkSubtitle: "Paste suspicious SMS, WhatsApp forward, or payment request before sending money.",
    placeholder: "Paste SMS, WhatsApp forward, or UPI ID (e.g. powerbill@okaxis)...",
    pasteBtn: "Paste from Clipboard",
    checkBtn: "Check for Scam",
    checking: "Analyzing with Dual-Engine...",
    presetLabel: "Or test live evaluation scenarios:",

    // Result Screen
    resultTitle: "Threat Evaluation Verdict",
    riskScore: "Risk Score",
    safeVerdict: "VERIFIED SAFE",
    cautionVerdict: "PROCEED WITH CAUTION",
    scamVerdict: "HIGH RISK SCAM DETECTED",
    safeSubtitle: "No known scam signatures or suspicious patterns were found.",
    cautionSubtitle: "Unverified counterparty. Exercise caution and verify identity.",
    scamSubtitle: "High probability of financial fraud. Do not transfer funds.",
    reasonsHeader: "Why was this flagged?",
    proceedToPay: "Proceed to Safe UPI Pay",
    backToCheck: "Scan Another Message",
    reportScam: "Report to Cyber Cell (1930)",

    // Pay Screen
    payTitle: "Safe UPI Pay Rail",
    paySubtitle: "Payment verified by TrustLayer threat intelligence.",
    payeeLabel: "Verified Payee VPA",
    amountLabel: "Amount to Send (INR ₹)",
    pinWarningTitle: "Golden UPI Safety Rule:",
    pinWarningDesc: "You NEVER need to enter your UPI PIN to receive money.",
    openUpiBtn: "Open UPI App (GPay / PhonePe / Paytm)",
    securitySealText: "TrustLayer Cryptographic Seal Attached",

    // Dashboard
    dashTitle: "Community Threat Intelligence",
    scamsBlocked: "Scams Blocked",
    fundsProtected: "Funds Protected",
    activeThreats: "Active Scam Patterns",
    trendingHeader: "Active Scam Vectors in India",
    recentHeader: "Your Recent Scans"
  },
  hi: {
    brandTag: "ज़ीरो-ट्रस्ट UPI सुरक्षा कवच",
    navCheck: "धोखाधड़ी जांच",
    navPay: "सुरक्षित भुगतान",
    navDashboard: "सुरक्षा डैशबोर्ड",
    navInclusion: "वित्तीय समावेशन",

    // Check Screen
    checkTitle: "संदेश या UPI आईडी की जांच करें",
    checkSubtitle: "पैसे भेजने से पहले संदिग्ध SMS, व्हाट्सएप संदेश या UPI आईडी यहां जांचें।",
    placeholder: "संदिग्ध SMS, व्हाट्सएप संदेश या UPI आईडी पेस्ट करें...",
    pasteBtn: "क्लिपबोर्ड से पेस्ट करें",
    checkBtn: "सुरक्षा जांचें",
    checking: "सुरक्षा जांच जारी है...",
    presetLabel: "या त्वरित परीक्षण परिदृश्य चुनें:",

    // Result Screen
    resultTitle: "सुरक्षा जांच परिणाम (Verdict)",
    riskScore: "जोखिम स्कोर",
    safeVerdict: "सत्यापित सुरक्षित (SAFE)",
    cautionVerdict: "सावधानी बरतें (CAUTION)",
    scamVerdict: "धोखाधड़ी का खतरा! (SCAM)",
    safeSubtitle: "कोई संदिग्ध धोखाधड़ी या ब्लैकलिस्टेड पैटर्न नहीं पाया गया।",
    cautionSubtitle: "अपुष्ट प्राप्तकर्ता। कृपया भुगतान से पहले व्यक्ति की पहचान जांचें।",
    scamSubtitle: "वित्तीय धोखाधड़ी का बहुत बड़ा खतरा। कतई पैसे न भेजें।",
    reasonsHeader: "जांच के मुख्य कारण:",
    proceedToPay: "सुरक्षित UPI भुगतान करें",
    backToCheck: "दूसरा संदेश जांचें",
    reportScam: "साइबर हेल्पलाइन (1930) पर रिपोर्ट करें",

    // Pay Screen
    payTitle: "सुरक्षित UPI भुगतान रेल",
    paySubtitle: "TrustLayer सुरक्षा द्वारा सत्यापित भुगतान।",
    payeeLabel: "प्राप्तकर्ता UPI आईडी",
    amountLabel: "भुगतान राशि (रुपये ₹)",
    pinWarningTitle: "UPI का सबसे बड़ा सुरक्षा नियम:",
    pinWarningDesc: "पैसे प्राप्त करने के लिए कभी भी अपना UPI PIN दर्ज न करें!",
    openUpiBtn: "UPI ऐप खोलें (PhonePe / GPay)",
    securitySealText: "TrustLayer सुरक्षा सील संलग्न",

    // Dashboard
    dashTitle: "सामुदायिक सुरक्षा खुफिया",
    scamsBlocked: "रोकी गई धोखाधड़ी",
    fundsProtected: "सुरक्षित की गई धनराशि",
    activeThreats: "सक्रिय धोखाधड़ी पैटर्न",
    trendingHeader: "भारत में सक्रिय मुख्य धोखाधड़ी",
    recentHeader: "आपकी हालिया जांचें"
  },
  bn: {
    brandTag: "জিরো-ট্রাস্ট UPI নিরাপত্তা কবচ",
    navCheck: "প্রতারণা যাচাই",
    navPay: "নিরাপদ পেমেন্ট",
    navDashboard: "নিরাপত্তা ড্যাশবোর্ড",
    navInclusion: "আর্থিক অন্তর্ভুক্তি",

    // Check Screen
    checkTitle: "মেসেজ বা UPI আইডি যাচাই করুন",
    checkSubtitle: "টাকা পাঠানোর আগে যেকোনো সন্দেহজনক SMS বা WhatsApp মেসেজ পরীক্ষা করুন।",
    placeholder: "সন্দেহজনক SMS বা UPI আইডি পেস্ট করুন...",
    pasteBtn: "ক্লিপবোর্ড থেকে পেস্ট করুন",
    checkBtn: "প্রতারণা যাচাই করুন",
    checking: "নিরাপত্তা যাচাই চলছে...",
    presetLabel: "বা লাইভ ডেমো দৃশ্যপট বাছুন:",

    // Result Screen
    resultTitle: "নিরাপত্তা পরীক্ষার ফলাফল",
    riskScore: "ঝুঁকির মাত্রা (Score)",
    safeVerdict: "যাচাইকৃত নিরাপদ (SAFE)",
    cautionVerdict: "সতর্কতা প্রয়োজন (CAUTION)",
    scamVerdict: "প্রতারণা সনাক্ত হয়েছে! (SCAM)",
    safeSubtitle: "কোনো ক্ষতিকারক বা প্রতারণামূলক প্যাটার্ন সনাক্ত হয়নি।",
    cautionSubtitle: "অপ্রমাণিত প্রাপক। লেনদেনের আগে যাচাই করুন।",
    scamSubtitle: "আর্থিক জালিয়াতির নিশ্চিত ঝুঁকি। কখনোই টাকা পাঠাবেন না।",
    reasonsHeader: "সনাক্তকরণের মূল কারণসমূহ:",
    proceedToPay: "নিরাপদ UPI পেমেন্টে যান",
    backToCheck: "অন্য মেসেজ যাচাই করুন",
    reportScam: "সাইবার ক্রাইমে রিপোর্ট করুন (১৯৩০)",

    // Pay Screen
    payTitle: "নিরাপদ UPI পেমেন্ট রেল",
    paySubtitle: "TrustLayer দ্বারা যাচাইকৃত লেনদেন।",
    payeeLabel: "প্রাপকের UPI আইডি",
    amountLabel: "টাকার পরিমাণ (₹)",
    pinWarningTitle: "UPI-এর সবচেয়ে জরুরি নিয়ম:",
    pinWarningDesc: "টাকা গ্রহণ করার সময় কখনোই আপনার UPI পিন দিতে হয় না!",
    openUpiBtn: "UPI অ্যাপ খুলুন (GPay / PhonePe)",
    securitySealText: "TrustLayer ডিজিটাল সিল সংবলিত",

    // Dashboard
    dashTitle: "কমিউনিটি নিরাপত্তা ইন্টেলিজেন্স",
    scamsBlocked: "প্রতিরোধ করা প্রতারণা",
    fundsProtected: "সুরক্ষিত টাকার পরিমাণ",
    activeThreats: "সক্রিয় স্ক্যাম প্যাটার্ন",
    trendingHeader: "ভারতে সক্রিয় সাম্প্রতিক স্ক্যাম",
    recentHeader: "আপনার পূর্ববর্তী যাচাইসমূহ"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const t = DICTIONARY[language] || DICTIONARY.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
