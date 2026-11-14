// Seed initial threat patterns into Cloud Firestore
const { db, isFirestoreConnected } = require('../config/firebase');

async function seed() {
  if (!isFirestoreConnected || !db) {
    console.log('[TrustLayer] Cloud Firestore is not connected yet.');
    console.log('Place your serviceAccountKey.json in C:\\trustlayer\\ or set .env variables to connect.');
    return;
  }

  console.log('[TrustLayer] Seeding active threat patterns into Cloud Firestore...');

  const patterns = [
    {
      id: 'pattern_electricity_discom',
      category: 'UTILITY_DISCONNECTION',
      title: 'State Electricity Disconnection Threat',
      severity: 'CRITICAL',
      indicators: ['disconnect', 'power cut', 'light cut', 'bijli', '9.30 pm', 'officer number'],
      vernacularKeywords: {
        hi: ['बिजली', 'लाइन कटेगी', 'तुरंत कॉल करें', 'बिल बकाया'],
        bn: ['বিদ্যুৎ সংযোগ বিচ্ছিন্ন', 'বিল বাকি', 'লাইন কাটা যাবে', 'অফিসার কল']
      },
      knownFraudVpas: ['powerbill@okaxis', 'bijlibill.update@ybl'],
      reportCount: 1420,
      active: true
    },
    {
      id: 'pattern_whatsapp_lottery',
      category: 'LOTTERY_IMPERSONATION',
      title: 'WhatsApp 25-Lakh Lottery Prize Scam',
      severity: 'CRITICAL',
      indicators: ['congratulations', '25,00,000', 'lottery', 'processing fee', 'tax clearance'],
      vernacularKeywords: {
        hi: ['बधाई', 'लॉटरी', 'इनाम', 'टैक्स जमा करें'],
        bn: ['অভিনন্দন', 'লটারি', 'পুরস্কার', 'ট্যাক্স জমা']
      },
      knownFraudVpas: ['lottery_reward99@okhdfc'],
      reportCount: 980,
      active: true
    },
    {
      id: 'pattern_part_time_job',
      category: 'TELEGRAM_PART_TIME_JOB',
      title: 'YouTube Like & Telegram Task Job Scam',
      severity: 'HIGH',
      indicators: ['daily earn', 'part time job', 'telegram task', 'security deposit', 'prepaid task'],
      vernacularKeywords: {
        hi: ['पार्ट टाइम जॉब', 'घर बैठे कमाई', 'डिपॉजिट'],
        bn: ['পার্ট টাইম কাজ', 'টেলিগ্রাম টাস্ক', 'ডিপোজিট']
      },
      knownFraudVpas: ['job_guarantee_deposit@ibl', 'fastcash_refund@paytm'],
      reportCount: 2310,
      active: true
    },
    {
      id: 'pattern_trai_sim',
      category: 'IMPERSONATION_TRAI',
      title: 'TRAI / Police SIM Card Deactivation Threat',
      severity: 'CRITICAL',
      indicators: ['trai', 'sim block', 'aadhar verification', 'police clearance', 'digital arrest'],
      vernacularKeywords: {
        hi: ['सिम बंद', 'आधार वेरिफिकेशन', 'पुलिस केस', 'डिजिटल अरेस्ट'],
        bn: ['সিম বন্ধ', 'আধার ভেরিফিকেশন', 'পুলিশ কেস', 'ডিজিটাল অ্যারেস্ট']
      },
      knownFraudVpas: ['urgent_kyc_update@ybl'],
      reportCount: 1850,
      active: true
    }
  ];

  for (const p of patterns) {
    await db.collection('scamPatterns').doc(p.id).set(p);
    console.log(`✓ Seeded ${p.id} (${p.title})`);
  }

  console.log('[TrustLayer] Cloud Firestore seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err.message);
  process.exit(1);
});
