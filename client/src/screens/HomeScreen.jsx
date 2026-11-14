import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck, Search, CreditCard, Wallet, Activity, Store, ArrowRight, Languages, Zap, KeyRound, Lock, Ban, PhoneCall
} from 'lucide-react';

const FEATURES = [
  { id: 'check', icon: Search, titleKey: 'navCheck', descKey: 'feat_check_desc', tone: 'bg-brand-50 text-brand-600 border-brand-100', ring: 'hover:border-brand-200' },
  { id: 'pay', icon: CreditCard, titleKey: 'navPay', descKey: 'feat_pay_desc', tone: 'bg-emerald-50 text-emerald-600 border-emerald-100', ring: 'hover:border-emerald-200' },
  { id: 'money', icon: Wallet, titleKey: 'navMoney', descKey: 'feat_money_desc', tone: 'bg-amber-50 text-amber-600 border-amber-100', ring: 'hover:border-amber-200' },
  { id: 'dashboard', icon: Activity, titleKey: 'navDashboard', descKey: 'feat_threat_desc', tone: 'bg-rose-50 text-rose-600 border-rose-100', ring: 'hover:border-rose-200' },
  { id: 'inclusion', icon: Store, titleKey: 'navInclusion', descKey: 'feat_inclusion_desc', tone: 'bg-sky-50 text-sky-600 border-sky-100', ring: 'hover:border-sky-200' }
];

const RULES = [
  { key: 'rule1', icon: KeyRound },
  { key: 'rule2', icon: Ban },
  { key: 'rule3', icon: PhoneCall }
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

      {/* Golden rules */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">{t.rulesHeader}</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RULES.map(({ key, icon: Icon }, i) => (
            <li key={key} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-card flex items-start gap-3">
              <span className="w-9 h-9 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">{i + 1}</span>
              <span className="text-sm text-slate-700 leading-relaxed flex-1">{t[key]}</span>
              <Icon className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
