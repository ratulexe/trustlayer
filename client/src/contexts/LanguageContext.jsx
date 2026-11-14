import React, { createContext, useContext, useState } from 'react';
import { MONEY_STRINGS } from './moneyStrings';
import { UI_STRINGS } from './uiStrings';
import { QR_STRINGS } from './qrStrings';

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
    paymentBlocked: "Payment blocked by TrustLayer to protect you",
    cautionChecklistTitle: "Before you pay, confirm each of these:",
    cautionCheck1: "I called this person or business on a number I already had, not one from this message.",
    cautionCheck2: "No one is rushing me, threatening me, or asking me to keep this secret.",
    cautionCheck3: "I am not paying a fee or deposit to receive a prize, refund, loan or job.",
    cautionCheck4: "I will never share my UPI PIN or OTP with anyone.",
    cooldownTitle: "Safety cool-down",
    cooldownDesc: "Scammers rush you. Take a moment before paying. You can continue in:",
    cooldownDone: "Cool-down complete.",
    cautionLockedBtn: "Complete the checklist and cool-down to continue",
    cautionProceedBtn: "Continue to payment",
    cautionConfirmTitle: "Are you sure?",
    cautionConfirmDesc: "This payee is not verified. UPI payments cannot be reversed once sent.",
    cautionConfirmYes: "Yes, I understand. Continue",
    cautionConfirmNo: "Cancel",
    cautionPayNote: "Unverified payee: you confirmed the safety checklist.",
    backLink: "Back to Check",

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
    paymentBlocked: "आपकी सुरक्षा के लिए TrustLayer ने यह भुगतान रोक दिया है",
    cautionChecklistTitle: "भुगतान से पहले, इन सभी बातों की पुष्टि करें:",
    cautionCheck1: "मैंने इस व्यक्ति या दुकान को अपने पास पहले से मौजूद नंबर पर कॉल किया है, इस संदेश वाले नंबर पर नहीं।",
    cautionCheck2: "कोई मुझ पर जल्दी करने का दबाव नहीं डाल रहा, धमकी नहीं दे रहा, या इसे गुप्त रखने को नहीं कह रहा।",
    cautionCheck3: "मैं कोई इनाम, रिफंड, लोन या नौकरी पाने के लिए फीस या जमा राशि नहीं दे रहा/रही हूँ।",
    cautionCheck4: "मैं अपना UPI PIN या OTP कभी किसी को नहीं बताऊँगा/बताऊँगी।",
    cooldownTitle: "सुरक्षा प्रतीक्षा समय",
    cooldownDesc: "धोखेबाज़ जल्दबाज़ी करवाते हैं। भुगतान से पहले थोड़ा रुकें। आप इतने समय बाद आगे बढ़ सकेंगे:",
    cooldownDone: "प्रतीक्षा समय पूरा हुआ।",
    cautionLockedBtn: "आगे बढ़ने के लिए सूची और प्रतीक्षा समय पूरा करें",
    cautionProceedBtn: "भुगतान के लिए आगे बढ़ें",
    cautionConfirmTitle: "क्या आप निश्चित हैं?",
    cautionConfirmDesc: "यह प्राप्तकर्ता सत्यापित नहीं है। UPI भुगतान भेजने के बाद वापस नहीं होता।",
    cautionConfirmYes: "हाँ, मैं समझता/समझती हूँ। आगे बढ़ें",
    cautionConfirmNo: "रद्द करें",
    cautionPayNote: "अपुष्ट प्राप्तकर्ता: आपने सुरक्षा सूची की पुष्टि की है।",
    backLink: "जांच पर वापस जाएं",

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
    paymentBlocked: "আপনার সুরক্ষার জন্য TrustLayer এই পেমেন্ট আটকে দিয়েছে",
    cautionChecklistTitle: "টাকা পাঠানোর আগে, নিচের প্রতিটি বিষয় নিশ্চিত করুন:",
    cautionCheck1: "আমি এই ব্যক্তি বা দোকানকে আমার কাছে আগে থেকে থাকা নম্বরে ফোন করেছি, এই মেসেজের নম্বরে নয়।",
    cautionCheck2: "কেউ আমাকে তাড়াহুড়ো করতে চাপ দিচ্ছে না, ভয় দেখাচ্ছে না বা বিষয়টি গোপন রাখতে বলছে না।",
    cautionCheck3: "আমি কোনো পুরস্কার, রিফান্ড, লোন বা চাকরি পাওয়ার জন্য ফি বা জমা দিচ্ছি না।",
    cautionCheck4: "আমি কখনো কাউকে আমার UPI PIN বা OTP বলব না।",
    cooldownTitle: "নিরাপত্তা অপেক্ষার সময়",
    cooldownDesc: "প্রতারকেরা তাড়াহুড়ো করায়। টাকা পাঠানোর আগে একটু থামুন। আপনি এগোতে পারবেন:",
    cooldownDone: "অপেক্ষার সময় শেষ।",
    cautionLockedBtn: "এগোতে তালিকা ও অপেক্ষার সময় সম্পূর্ণ করুন",
    cautionProceedBtn: "পেমেন্টের জন্য এগিয়ে যান",
    cautionConfirmTitle: "আপনি কি নিশ্চিত?",
    cautionConfirmDesc: "এই প্রাপক যাচাই করা নয়। UPI পেমেন্ট একবার পাঠালে ফেরত আসে না।",
    cautionConfirmYes: "হ্যাঁ, আমি বুঝেছি। এগিয়ে যান",
    cautionConfirmNo: "বাতিল করুন",
    cautionPayNote: "অযাচাইকৃত প্রাপক: আপনি নিরাপত্তা তালিকা নিশ্চিত করেছেন।",
    backLink: "যাচাইয়ে ফিরে যান",

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
  const t = {
    ...(UI_STRINGS[language] || UI_STRINGS.en),
    ...(QR_STRINGS[language] || QR_STRINGS.en),
    ...(MONEY_STRINGS[language] || MONEY_STRINGS.en),
    ...(DICTIONARY[language] || DICTIONARY.en)
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
