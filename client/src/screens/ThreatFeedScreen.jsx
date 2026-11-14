import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  SearchIcon, 
  ShieldAlertIcon, 
  ArrowRightIcon, 
  ZapIcon, 
  GiftIcon, 
  LockIcon, 
  PhoneCallIcon,
  ActivityIcon,
  SparklesIcon
} from '../components/Icons';

export default function ThreatFeedScreen({ onInspectScenario }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const THREATS = [
    {
      id: 'th-01',
      category: 'UTILITY',
      title: 'State Electricity Power Disconnection Phishing',
      severity: 'CRITICAL',
      score: 92,
      source: 'Verified Pattern Dataset',
      sourceType: 'verified',
      color: 'rose',
      regions: ['Delhi NCR', 'West Bengal', 'Maharashtra', 'Uttar Pradesh'],
      samplePayload: 'Dear customer, your electricity power will be disconnected tonight at 9.30 PM from electricity office. Please immediately pay pending bill of ₹850 to powerbill@okaxis or call officer at 9876543210',
      indicators: ['Artificial Urgency (Tonight at 9:30 PM)', 'Personal VPA instead of State DISCOM portal', 'Direct phone call threat to intimidate'],
      countermeasure: 'Official state electricity boards never collect dues via personal UPI IDs or threat SMS. Always pay exclusively through the official DISCOM consumer portal or BBPS.'
    },
    {
      id: 'th-02',
      category: 'LOTTERY',
      title: 'WhatsApp Special Scheme ₹25L Cash Prize Scam',
      severity: 'CRITICAL',
      score: 95,
      source: 'Live Community Report',
      sourceType: 'community',
      color: 'rose',
      regions: ['Pan India (Vernacular targets)'],
      samplePayload: 'Congratulations! You won ₹25,00,000 in Special Scheme. To release your fund immediately transfer processing tax of ₹4,999 to lottery_reward99@okhdfc',
      indicators: ['Advance-fee fraud structure', 'Unsolicited lottery notification', 'Demands processing tax before payout'],
      countermeasure: 'Legitimate lotteries and awards never ask winners to transfer money or processing tax to release prizes. Never send money to claim prize funds.'
    },
    {
      id: 'th-03',
      category: 'COLLECT',
      title: 'Reverse UPI PIN Marketplace Collect Scam',
      severity: 'CRITICAL',
      score: 88,
      source: 'Verified Pattern Dataset',
      sourceType: 'verified',
      color: 'amber',
      regions: ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune'],
      samplePayload: 'I am paying ₹15,000 for your used furniture on OLX. Please scan this QR code or accept collect request and enter your UPI PIN to receive money in your account.',
      indicators: ['Claims UPI PIN is needed to receive money', 'Remote QR code sent via WhatsApp', 'Aggressive buyer urgency'],
      countermeasure: 'You NEVER need to enter your UPI PIN to receive money. Entering your PIN always deducts funds from your account.'
    },
    {
      id: 'th-04',
      category: 'KYC',
      title: 'Unauthorized Bank KYC Expiry & Account Freeze Threat',
      severity: 'HIGH',
      score: 84,
      source: 'Live Community Report',
      sourceType: 'community',
      color: 'amber',
      regions: ['All Metro & Tier-2 cities'],
      samplePayload: 'Your SBI/HDFC bank account has been blocked due to pending KYC verification. Please click bit.ly/kyc-sbi-update immediately or deposit ₹10 verification charge to urgent_kyc_update@ybl',
      indicators: ['2-hour ultimatum', 'Third-party bit.ly shortlink', 'Personal UPI ID for bank verification'],
      countermeasure: 'Banks never suspend accounts with 2-hour SMS ultimatums or ask for verification payments to personal VPAs. Visit your official bank branch or netbanking portal.'
    },
    {
      id: 'th-05',
      category: 'JOB',
      title: 'YouTube Video Like / Telegram Part-Time Job Scam',
      severity: 'HIGH',
      score: 79,
      source: 'Live Community Report',
      sourceType: 'community',
      color: 'slate',
      regions: ['National (College students & freelancers)'],
      samplePayload: 'Earn ₹3,000 to ₹8,000 daily by liking YouTube videos. Work from home 30 minutes daily. To start daily task deposit security deposit ₹1,500 to job_guarantee_deposit@ibl',
      indicators: ['Unrealistic returns for trivial tasks', 'Prepaid task investment requirement', 'Recruitment via WhatsApp/Telegram'],
      countermeasure: 'Legitimate companies never ask employees or freelancers for an upfront security deposit to work or assign tasks.'
    }
  ];

  const filteredThreats = THREATS.filter((item) => {
    const matchesFilter = 
      activeFilter === 'ALL' ||
      (activeFilter === 'UTILITY' && item.category === 'UTILITY') ||
      (activeFilter === 'LOTTERY' && item.category === 'LOTTERY') ||
      (activeFilter === 'KYC' && item.category === 'KYC') ||
      (activeFilter === 'COLLECT' && item.category === 'COLLECT');

    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.samplePayload.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.regions.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2 pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857] uppercase tracking-wider">
          <ActivityIcon className="w-3.5 h-3.5 text-[#059669]" />
          <span>CYBERSECURITY INTELLIGENCE DASHBOARD</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-editorial text-[#0F1F17] tracking-tight">
          {t.feedTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6B63] max-w-lg mx-auto">
          {t.feedSubtitle}
        </p>
      </div>

      {/* Analytics Overview Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D4E0D5] shadow-[0_4px_20px_rgba(15,31,23,0.03)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2EAE3] pb-3">
          <span className="text-xs font-bold text-[#0F1F17] font-sans flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#059669]" />
            Active Threat Vector Distribution (Pan-India Live Signatures)
          </span>
          <span className="text-[10px] font-mono text-[#047857] bg-[#E6F7EF] px-2 py-0.5 rounded border border-[#A7F3D0]">
            UPDATED: 5 MINS AGO
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FFE4E6]/50 border border-[#FECDD3]">
            <span className="text-[10px] text-[#9F1239] block">Utility / Electricity</span>
            <span className="text-xl font-bold text-[#BE123C] font-mono">38%</span>
            <span className="text-[10px] text-[#9F1239] block mt-0.5">5,820 Reports</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#FEF3C7]/50 border border-[#FDE68A]">
            <span className="text-[10px] text-[#92400E] block">Lottery / Cash Prize</span>
            <span className="text-xl font-bold text-[#B45309] font-mono">26%</span>
            <span className="text-[10px] text-[#92400E] block mt-0.5">3,980 Reports</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#E6F7EF] border border-[#A7F3D0]">
            <span className="text-[10px] text-[#065F46] block">Reverse UPI PIN</span>
            <span className="text-xl font-bold text-[#059669] font-mono">19%</span>
            <span className="text-[10px] text-[#065F46] block mt-0.5">2,910 Reports</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#EAF0EB] border border-[#D4E0D5]">
            <span className="text-[10px] text-[#5C6B63] block">KYC Freeze Threats</span>
            <span className="text-xl font-bold text-[#0F1F17] font-mono">11%</span>
            <span className="text-[10px] text-[#5C6B63] block mt-0.5">1,680 Reports</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#EAF0EB] p-1 rounded-2xl border border-[#D4E0D5] w-full sm:w-auto">
          {['ALL', 'UTILITY', 'LOTTERY', 'KYC', 'COLLECT'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeFilter === f
                  ? 'bg-white text-[#0F1F17] font-bold shadow-xs border border-[#D4E0D5]'
                  : 'text-[#5C6B63] hover:text-[#0F1F17]'
              }`}
            >
              {f === 'ALL' ? t.filterAll : f === 'UTILITY' ? t.filterUtility : f === 'LOTTERY' ? t.filterLottery : f === 'KYC' ? t.filterKyc : t.filterCollect}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6B63]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchFeedPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#D4E0D5] text-[#0F1F17] placeholder:text-[#8E9C94] text-xs focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:border-[#059669]"
          />
        </div>
      </div>

      {/* Threat Cards Stream */}
      <div className="space-y-4">
        {filteredThreats.map((threat) => (
          <div
            key={threat.id}
            className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D4E0D5] space-y-4 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)] text-left"
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2EAE3] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] font-mono">
                  {threat.severity} ({threat.score}/100)
                </span>
                <span className="font-extrabold text-sm sm:text-base text-[#0F1F17] font-sans">
                  {threat.title}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded border ${
                  threat.sourceType === 'verified'
                    ? 'bg-[#E6F7EF] text-[#047857] border-[#A7F3D0]'
                    : 'bg-[#EAF0EB] text-[#5C6B63] border-[#D4E0D5]'
                }`}>
                  {threat.source}
                </span>
              </div>
            </div>

            {/* Intercepted Payload */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#D4E0D5] text-xs space-y-1">
              <span className="text-[10px] font-mono text-[#059669] font-bold block">
                INTERCEPTED SMS / WHATSAPP PAYLOAD:
              </span>
              <p className="font-mono text-[#0F1F17] text-xs leading-relaxed">
                "{threat.samplePayload}"
              </p>
            </div>

            {/* Key Indicators */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[#0F1F17] text-[11px] block">
                {t.keyIndicators}
              </span>
              <div className="flex flex-wrap gap-2">
                {threat.indicators.map((ind, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-[#EAF0EB] border border-[#D4E0D5] text-[#5C6B63] text-[11px]"
                  >
                    • {ind}
                  </span>
                ))}
              </div>
            </div>

            {/* Countermeasure */}
            <div className="p-3 rounded-2xl bg-[#E6F7EF] border border-[#A7F3D0] text-xs text-[#065F46] space-y-0.5">
              <span className="font-bold font-mono text-[10px] text-[#047857] block">
                {t.countermeasure}
              </span>
              <p className="leading-relaxed text-[11px]">
                {threat.countermeasure}
              </p>
            </div>

            {/* Actions & Regions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-[#5C6B63] font-mono">
                <span>AFFECTED:</span>
                <span>{threat.regions.join(', ')}</span>
              </div>

              <button
                onClick={() => onInspectScenario(threat.samplePayload)}
                className="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <span>{t.testInInspector}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
