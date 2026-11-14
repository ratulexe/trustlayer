import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Search, CreditCard, Activity, Globe } from 'lucide-react';

export default function Header({ currentScreen, setCurrentScreen }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-surface border-b border-slate-200 sticky top-0 z-50 shadow-subtle">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setCurrentScreen('check')} 
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900 font-display">TrustLayer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100 font-bold uppercase tracking-wider">
                FinTech
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">{t.brandTag}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setCurrentScreen('check')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              currentScreen === 'check' || currentScreen === 'result'
                ? 'bg-surface text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.navCheck}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('pay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              currentScreen === 'pay'
                ? 'bg-surface text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t.navPay}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              currentScreen === 'dashboard'
                ? 'bg-surface text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.navDashboard}</span>
          </button>
          <button
            onClick={() => setCurrentScreen('inclusion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              currentScreen === 'inclusion'
                ? 'bg-surface text-slate-900 shadow-sm border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t.navInclusion || 'Financial Inclusion'}</span>
          </button>
        </nav>

        {/* Vernacular Language Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <div className="px-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition ${language === 'en' ? 'bg-surface text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-md transition ${language === 'hi' ? 'bg-surface text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2 py-1 rounded-md transition ${language === 'bn' ? 'bg-surface text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              বাংলা
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
