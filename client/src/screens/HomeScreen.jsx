import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowRightIcon,
  LayersIcon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeIcon,
  ZapIcon,
  CheckCircle2Icon,
  ActivityIcon,
  CpuIcon,
  LockIcon
} from '../components/Icons';
import {
  Search, CreditCard, Wallet, Activity, Store, BarChart3, ArrowRight,
  KeyRound, PhoneCall, Link, ShieldAlert, Landmark, Clock, Smartphone
} from 'lucide-react';

// Home = the redesign's landing page (hero, architecture, closing CTA) plus the feature
// hub and golden rules, so every feature is reachable from the page body.
const FEATURES = [
  { id: 'check', icon: Search, titleKey: 'navCheck', descKey: 'feat_check_desc', tone: 'bg-[#E6F7EF] text-[#047857] border-[#A7F3D0]' },
  { id: 'pay', icon: CreditCard, titleKey: 'navPay', descKey: 'feat_pay_desc', tone: 'bg-[#E6F7EF] text-[#047857] border-[#A7F3D0]' },
  { id: 'money', icon: Wallet, titleKey: 'navMoney', descKey: 'feat_money_desc', tone: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]' },
  { id: 'feed', icon: Activity, titleKey: 'navFeed', descKey: 'feat_threat_desc', tone: 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]' },
  { id: 'impact', icon: BarChart3, titleKey: 'navImpact', descKey: 'feat_impact_desc', tone: 'bg-[#EAF0EB] text-[#0F1F17] border-[#D4E0D5]' },
  { id: 'inclusion', icon: Store, titleKey: 'navInclusion', descKey: 'feat_inclusion_desc', tone: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]' }
];

const SECURITY_POINTS = [
  {
    id: 'link',
    icon: Link,
    tagKey: 'secPoint1Tag',
    titleKey: 'secPoint1Title',
    descKey: 'secPoint1Desc'
  },
  {
    id: 'pin',
    icon: KeyRound,
    tagKey: 'secPoint2Tag',
    titleKey: 'secPoint2Title',
    descKey: 'secPoint2Desc'
  },
  {
    id: 'vpa',
    icon: Landmark,
    tagKey: 'secPoint3Tag',
    titleKey: 'secPoint3Title',
    descKey: 'secPoint3Desc'
  },
  {
    id: 'urgency',
    icon: Clock,
    tagKey: 'secPoint4Tag',
    titleKey: 'secPoint4Title',
    descKey: 'secPoint4Desc'
  },
  {
    id: 'screen',
    icon: Smartphone,
    tagKey: 'secPoint5Tag',
    titleKey: 'secPoint5Title',
    descKey: 'secPoint5Desc'
  },
  {
    id: 'helpline',
    icon: PhoneCall,
    tagKey: 'secPoint6Tag',
    titleKey: 'secPoint6Title',
    descKey: 'secPoint6Desc'
  }
];

export default function HomeScreen({ onNavigate }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <div className="space-y-12 sm:space-y-20 pb-8">
      {firstName && (
        <p className="text-sm font-semibold text-[#047857]">
          {t.homeGreeting}, {firstName}
        </p>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: EDITORIAL TYPOGRAPHY & ORGANIC DATA-STREAM VECTOR LINES */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#D4E0D5] shadow-[0_4px_24px_rgba(15,31,23,0.03),0_20px_50px_rgba(15,31,23,0.02)] p-7 sm:p-12 lg:p-16">
        
        {/* Subtle Ambient Radial Mint & Sage Background Accents */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-[#E6F7EF]/60 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-[#EAF0EB]/80 blur-[80px] pointer-events-none" />

        {/* ORGANIC WAVE / DATA-STREAM VECTOR LINES (Pareto Style) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-70">
          <svg className="w-full h-full" viewBox="0 0 1200 650" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Stream 1: Top Left to Center */}
            <path 
              d="M-50,120 C250,90 350,280 620,290 C850,300 950,220 1250,260" 
              stroke="#D4E0D5" 
              strokeWidth="1.5" 
            />
            <path 
              d="M-50,120 C250,90 350,280 620,290 C850,300 950,220 1250,260" 
              stroke="#059669" 
              strokeWidth="1.5" 
              className="animate-stream-flow"
              opacity="0.45"
            />

            {/* Stream 2: Mid-Left curving upward */}
            <path 
              d="M-40,240 C200,220 400,160 620,270 C840,380 1020,310 1260,340" 
              stroke="#E2EAE3" 
              strokeWidth="1.2" 
            />
            <path 
              d="M-40,240 C200,220 400,160 620,270 C840,380 1020,310 1260,340" 
              stroke="#34D399" 
              strokeWidth="1.2" 
              className="animate-stream-flow-fast"
              opacity="0.4"
            />

            {/* Stream 3: Bottom Left to Center Right */}
            <path 
              d="M-60,420 C180,440 380,330 650,320 C900,310 1040,460 1280,420" 
              stroke="#D4E0D5" 
              strokeWidth="1.5" 
            />
            <path 
              d="M-60,420 C180,440 380,330 650,320 C900,310 1040,460 1280,420" 
              stroke="#059669" 
              strokeWidth="1.5" 
              className="animate-stream-flow"
              opacity="0.35"
            />

            {/* Stream 4: Gentle lower wave */}
            <path 
              d="M-30,520 C220,500 450,470 700,430 C950,390 1100,490 1250,510" 
              stroke="#E2EAE3" 
              strokeWidth="1" 
            />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow Pill (Mint Badge) */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#047857] uppercase">
                {t.heroEyebrow}
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-serif-editorial text-[#0F1F17] tracking-tight leading-[1.12]">
              {t.heroHeadline}
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-[#5C6B63] max-w-xl leading-relaxed font-sans font-normal">
              {t.heroSubtext}
            </p>

            {/* Two CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('check')}
                className="px-6 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-[0_4px_16px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_22px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <span>{t.ctaAnalyze}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('feed')}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#EAF0EB] text-[#0F1F17] font-semibold text-sm border border-[#D4E0D5] hover:border-[#5C6B63] transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <LayersIcon className="w-4 h-4 text-[#059669]" />
                <span>{t.ctaExplore}</span>
              </button>
            </div>

            {/* Three Feature Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-[#D4E0D5] text-xs text-[#0F1F17]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-[#047857]">
                  <SparklesIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] sm:text-xs text-[#0F1F17]">{t.trustAi}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-[#047857]">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] sm:text-xs text-[#0F1F17]">{t.trustExplain}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-[#047857]">
                  <GlobeIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] sm:text-xs text-[#0F1F17]">{t.trustMulti}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Interactive Security Preview Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[350px] sm:min-h-[420px]">
            
            {/* Center Glowing Focal Ambient Circle */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#A7F3D0]/40 to-[#E6F7EF] blur-2xl pointer-events-none" />

            {/* Central Elevated Shield Preview Card */}
            <div 
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 border border-[#D4E0D5] shadow-[0_12px_36px_rgba(15,31,23,0.06),0_2px_8px_rgba(15,31,23,0.03)] space-y-4 animate-float-gentle"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#E2EAE3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#059669] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    TL
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0F1F17] block font-sans">
                      Threat Shield Preview
                    </span>
                    <span className="text-[10px] font-mono text-[#059669] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      LIVE ACTIVE GUARD
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#5C6B63] bg-[#EAF0EB] px-2 py-0.5 rounded-md border border-[#D4E0D5]">
                  &lt;14ms
                </span>
              </div>

              {/* Simulated Scan Wave Visualization */}
              <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2EAE3] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#5C6B63]">
                  <span>SIMULATED VPA</span>
                  <span className="text-[#059669] font-bold">VERIFIED</span>
                </div>
                <div className="font-mono text-xs font-bold text-[#0F1F17]">
                  chaispot@okicici
                </div>
                <div className="h-1.5 w-full bg-[#E2EAE3] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] w-full rounded-full" />
                </div>
              </div>

              {/* Intercepted Phishing Tag */}
              <div className="p-3 rounded-2xl bg-[#FFE4E6]/60 border border-[#F43F5E]/30 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#F43F5E]">
                  <span className="flex items-center gap-1">
                    <ZapIcon className="w-3 h-3" />
                    POWER BILL TRAP
                  </span>
                  <span>92/100 RISK</span>
                </div>
                <p className="text-[11px] text-[#0F1F17] line-clamp-1">
                  "Electricity will be disconnected at 9.30 PM..."
                </p>
                <div className="text-[10px] text-[#F43F5E] font-semibold">
                  Blocked before debit
                </div>
              </div>

              {/* Telemetry Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6B63] pt-1 border-t border-[#E2EAE3]">
                <span>DUAL ENGINE: HEURISTICS + GEMINI</span>
                <span className="text-[#059669] font-bold">99.8% ACCURACY</span>
              </div>
            </div>

            {/* Small Floating Micro-Card (Top Right) */}
            <div className="absolute -top-3 right-0 sm:-right-2 z-20 animate-float-gentle hidden sm:block">
              <div className="bg-white p-3 rounded-2xl border border-[#D4E0D5] shadow-md text-xs flex items-center gap-2">
                <CheckCircle2Icon className="w-4 h-4 text-[#059669]" />
                <span className="font-mono text-[11px] text-[#0F1F17] font-semibold">
                  NPCI URI Compliant
                </span>
              </div>
            </div>

            {/* Small Floating Micro-Card (Bottom Left) */}
            <div className="absolute -bottom-3 left-0 sm:-left-2 z-20 hidden sm:block">
              <div className="bg-white p-2.5 rounded-2xl border border-[#D4E0D5] shadow-md text-xs flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-[#059669]" />
                <span className="font-mono text-[11px] text-[#5C6B63]">
                  15,310 Signatures
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Feature hub: every feature lives in the page, not the navbar */}
      <section className="space-y-5">
        <h2 className="font-serif-editorial text-3xl sm:text-4xl text-[#0F1F17]">{t.featuresHeader}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ id, icon: Icon, titleKey, descKey, tone }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="group text-left sage-card sage-card-hover rounded-2xl p-5 flex items-start gap-4"
            >
              <span className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center ${tone}`}>
                <Icon className="w-6 h-6" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-[#0F1F17]">{t[titleKey]}</span>
                  <ArrowRight className="w-5 h-5 text-[#8E9C94] group-hover:text-[#059669] group-hover:translate-x-0.5 transition shrink-0" />
                </span>
                <span className="block mt-1 text-sm text-[#5C6B63] leading-relaxed">{t[descKey]}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Point-wise Security & Cyber Crime Advisory Section */}
      <section className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#D4E0D5]/70 pb-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFE4E6] border border-[#FECDD3] text-[10px] font-mono text-[#BE123C] uppercase tracking-wider font-semibold">
              <ShieldAlert className="w-3.5 h-3.5 text-[#BE123C]" />
              <span>{t.securityAdvisoryTag || 'CYBER CRIME & FRAUD ADVISORY'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#BE123C] animate-pulse" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif-editorial text-[#0F1F17] tracking-tight">
              {t.securityChecklistTitle || 'Security Rules & Scam Defense Guide'}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6B63] leading-relaxed">
              {t.securityChecklistSub || 'Essential rules verified by Cyber Crime Cell — remember these before clicking or paying:'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('check')}
            className="self-start sm:self-auto px-5 py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(5,150,105,0.2)] hover:-translate-y-0.5 active:translate-y-0 transition flex items-center gap-2 shrink-0 font-sans cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{t.homeCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Point-Wise Separate Animated Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECURITY_POINTS.map((pt, index) => {
            const Icon = pt.icon;
            return (
              <div
                key={pt.id}
                onClick={() => onNavigate('check')}
                style={{ animationDelay: `${index * 0.4}s` }}
                className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-[#D4E0D5] hover:border-[#059669] transition-all duration-300 ease-out shadow-[0_4px_16px_rgba(15,31,23,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(5,150,105,0.18)] hover:-translate-y-2 active:scale-[0.98] cursor-pointer flex flex-col justify-between space-y-4 animate-float-gentle"
              >
                {/* Top Glowing Shimmer Beam on Hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#34D399] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#059669] bg-[#E6F7EF] border border-[#A7F3D0] px-2.5 py-0.5 rounded-lg group-hover:bg-[#059669] group-hover:text-white group-hover:border-[#059669] transition-colors duration-300">
                      {t.pointLabel || 'Point'} 0{index + 1}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-[#5C6B63] bg-[#F7FAF8] border border-[#E2EAE3] px-2.5 py-0.5 rounded-full uppercase tracking-wider group-hover:border-[#A7F3D0] group-hover:text-[#047857] transition-colors duration-300">
                      {t[pt.tagKey]}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669] group-hover:bg-[#059669] group-hover:text-white group-hover:scale-110 group-hover:rotate-[-6deg] group-hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] transition-all duration-300">
                      <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F1F17] font-sans leading-snug group-hover:text-[#047857] transition-colors duration-300">
                      {t[pt.titleKey]}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5C6B63] leading-relaxed">
                    {t[pt.descKey]}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAF0EB] flex items-center justify-between text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
                    </span>
                    <span>ZERO-TRUST GUARD</span>
                  </span>
                  <span className="text-[#8E9C94] group-hover:text-[#059669] transition-colors duration-300 flex items-center gap-1 font-semibold">
                    <span>TEST THIS SCAM</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ARCHITECTURE: "CALM INTELLIGENCE. UNCOMPROMISING SECURITY." */}
      {/* ========================================================================= */}
      <section id="architecture-section" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857] uppercase tracking-wider">
            <CpuIcon className="w-3.5 h-3.5" />
            <span>FINTECH CYBERSECURITY ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-editorial text-[#0F1F17] tracking-tight">
            {t.futureOfTrust}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B63] leading-relaxed">
            {t.futureOfTrustSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] space-y-3.5 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <ZapIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F1F17] font-sans">
              {t.heuristicsEngineTitle}
            </h3>
            <p className="text-xs text-[#5C6B63] leading-relaxed">
              {t.heuristicsEngineDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#059669] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>&lt;1ms DETERMINISTIC ENGINE</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] space-y-3.5 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F1F17] font-sans">
              {t.geminiEngineTitle}
            </h3>
            <p className="text-xs text-[#5C6B63] leading-relaxed">
              {t.geminiEngineDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#059669] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>MULTILINGUAL CONTEXTUAL AI</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] space-y-3.5 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <LockIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F1F17] font-sans">
              {t.npciRailTitle}
            </h3>
            <p className="text-xs text-[#5C6B63] leading-relaxed">
              {t.npciRailDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#059669] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>ZERO-TRUST PAYMENT INTENT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CLOSING CTA: CALM SAGE EDITORIAL BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-[#EAF0EB] p-8 sm:p-12 border border-[#D4E0D5] text-center space-y-4 shadow-sm">
        <h3 className="text-2xl sm:text-3xl font-serif-editorial text-[#0F1F17] tracking-tight max-w-xl mx-auto">
          {t.closingCtaTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#5C6B63] max-w-lg mx-auto leading-relaxed">
          {t.closingCtaDesc}
        </p>

        <div className="pt-2">
          <button
            onClick={() => onNavigate('check')}
            className="px-6 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-[0_4px_16px_rgba(5,150,105,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
          >
            <span>{t.closingCtaBtn}</span>
            <ArrowRightIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>
    </div>
  );
}
