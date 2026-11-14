import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck, Search, CreditCard, Wallet, Activity, Store, ArrowRight, Languages, Zap, KeyRound, Lock, PhoneCall, Link, ShieldAlert, Landmark, Clock, Smartphone
} from 'lucide-react';

const FEATURES = [
  { id: 'check', icon: Search, titleKey: 'navCheck', descKey: 'feat_check_desc', tone: 'bg-brand-50 text-brand-600 border-brand-100', ring: 'hover:border-brand-200' },
  { id: 'pay', icon: CreditCard, titleKey: 'navPay', descKey: 'feat_pay_desc', tone: 'bg-emerald-50 text-emerald-600 border-emerald-100', ring: 'hover:border-emerald-200' },
  { id: 'money', icon: Wallet, titleKey: 'navMoney', descKey: 'feat_money_desc', tone: 'bg-amber-50 text-amber-600 border-amber-100', ring: 'hover:border-amber-200' },
  { id: 'dashboard', icon: Activity, titleKey: 'navDashboard', descKey: 'feat_threat_desc', tone: 'bg-rose-50 text-rose-600 border-rose-100', ring: 'hover:border-rose-200' },
  { id: 'inclusion', icon: Store, titleKey: 'navInclusion', descKey: 'feat_inclusion_desc', tone: 'bg-sky-50 text-sky-600 border-sky-100', ring: 'hover:border-sky-200' }
];

const SECURITY_POINTS = [
  {
    id: 'link',
    icon: Link,
    tagKey: 'secPoint1Tag',
    titleKey: 'secPoint1Title',
    descKey: 'secPoint1Desc',
    badgeTone: 'bg-rose-50 text-rose-700 border-rose-200',
    iconTone: 'bg-rose-50 text-rose-600 border-rose-100',
    numTone: 'bg-rose-100 text-rose-800'
  },
  {
    id: 'pin',
    icon: KeyRound,
    tagKey: 'secPoint2Tag',
    titleKey: 'secPoint2Title',
    descKey: 'secPoint2Desc',
    badgeTone: 'bg-amber-50 text-amber-700 border-amber-200',
    iconTone: 'bg-amber-50 text-amber-600 border-amber-100',
    numTone: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'vpa',
    icon: Landmark,
    tagKey: 'secPoint3Tag',
    titleKey: 'secPoint3Title',
    descKey: 'secPoint3Desc',
    badgeTone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconTone: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    numTone: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'urgency',
    icon: Clock,
    tagKey: 'secPoint4Tag',
    titleKey: 'secPoint4Title',
    descKey: 'secPoint4Desc',
    badgeTone: 'bg-purple-50 text-purple-700 border-purple-200',
    iconTone: 'bg-purple-50 text-purple-600 border-purple-100',
    numTone: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'screen',
    icon: Smartphone,
    tagKey: 'secPoint5Tag',
    titleKey: 'secPoint5Title',
    descKey: 'secPoint5Desc',
    badgeTone: 'bg-red-50 text-red-700 border-red-200',
    iconTone: 'bg-red-50 text-red-600 border-red-100',
    numTone: 'bg-red-100 text-red-800'
  },
  {
    id: 'helpline',
    icon: PhoneCall,
    tagKey: 'secPoint6Tag',
    titleKey: 'secPoint6Title',
    descKey: 'secPoint6Desc',
    badgeTone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconTone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    numTone: 'bg-emerald-100 text-emerald-800'
  }
];

export default function HomeScreen({ onNavigate }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-indigo-500 to-violet-500 text-white shadow-float">
        <div aria-hidden="true" className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute right-10 bottom-[-5rem] w-56 h-56 rounded-full bg-white/10" />
        <ShieldCheck aria-hidden="true" className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 w-44 h-44 text-white/20" strokeWidth={1.25} />

        <div className="relative px-5 py-8 sm:px-10 sm:py-12 max-w-2xl">
          <p className="text-sm font-semibold text-indigo-100">
            {t.homeGreeting}{firstName ? `, ${firstName}` : ''}
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight font-display leading-tight">{t.homeHeadline}</h1>
          <p className="mt-3 text-base sm:text-lg text-indigo-50/95 leading-relaxed">{t.homeSub}</p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => onNavigate('check')}
              className="h-12 px-6 rounded-xl bg-white text-brand-600 font-bold text-base shadow-lg hover:bg-indigo-50 transition flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {t.homeCta}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pay')}
              className="h-12 px-6 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-base transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              {t.homeCtaPay}
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-indigo-50">
            <li className="flex items-center gap-1.5"><Languages className="w-4 h-4" />{t.homeTrust1}</li>
            <li className="flex items-center gap-1.5"><Zap className="w-4 h-4" />{t.homeTrust2}</li>
            <li className="flex items-center gap-1.5"><Lock className="w-4 h-4" />{t.homeTrust3}</li>
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">{t.featuresHeader}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ id, icon: Icon, titleKey, descKey, tone, ring }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`group text-left bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card ${ring} hover:-translate-y-0.5 hover:shadow-lg transition flex items-start gap-4`}
            >
              <span className={`w-12 h-12 shrink-0 rounded-xl border flex items-center justify-center ${tone}`}>
                <Icon className="w-6 h-6" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-slate-900 font-display">{t[titleKey]}</span>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition shrink-0" />
                </span>
                <span className="block mt-1 text-sm text-slate-600 leading-relaxed">{t[descKey]}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Point-wise Security & Cyber Crime Advisory Section */}
      <section className="bg-gradient-to-b from-rose-50/60 via-slate-50 to-white border border-rose-200/90 rounded-3xl p-5 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-rose-100 pb-5">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-rose-700 uppercase tracking-wider">
                  {t.securityAdvisoryTag || 'CYBER CRIME & FRAUD ADVISORY'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                {t.securityChecklistTitle || 'Security Rules & Scam Defense Guide'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {t.securityChecklistSub || 'Essential rules verified by Cyber Crime Cell — remember these before clicking or paying:'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('check')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 shrink-0 font-display"
          >
            <Search className="w-4 h-4" />
            <span>{t.homeCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Point-Wise Separate Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECURITY_POINTS.map((pt, index) => {
            const Icon = pt.icon;
            return (
              <div
                key={pt.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${pt.numTone}`}>
                      {t.pointLabel || 'Point'} {index + 1}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${pt.badgeTone}`}>
                      {t[pt.tagKey]}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${pt.iconTone}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 font-display leading-snug">
                      {t[pt.titleKey]}
                    </h3>
                  </div>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed pl-10.5">
                    {t[pt.descKey]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
