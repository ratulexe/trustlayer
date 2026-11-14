import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Header({ currentScreen, setCurrentScreen }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-[#FAFAF8]/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setCurrentScreen('check')} 
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrentScreen('check'); }}
          aria-label="TrustLayer Home"
        >
          <div className="w-10 h-10 rounded-xl bg-[#172554] text-white flex items-center justify-center font-bold text-lg border border-blue-500/30 shadow-[0_2px_8px_-2px_rgba(23,37,84,0.25)] font-display transition group-hover:border-blue-400">
            TL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#111827] font-display">TrustLayer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#172554] border border-slate-200 font-semibold tracking-wider">
                FinTech Rail
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] hidden sm:block leading-none mt-0.5">{t.brandTag}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setCurrentScreen('check')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentScreen === 'check' || currentScreen === 'result'
                ? 'bg-white text-[#111827] shadow-[0_1px_3px_rgba(23,37,84,0.06)] border border-slate-200/80 font-bold'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            {t.navCheck}
          </button>
          <button
            onClick={() => setCurrentScreen('pay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentScreen === 'pay'
                ? 'bg-white text-[#111827] shadow-[0_1px_3px_rgba(23,37,84,0.06)] border border-slate-200/80 font-bold'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            {t.navPay}
          </button>
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              currentScreen === 'dashboard'
                ? 'bg-white text-[#111827] shadow-[0_1px_3px_rgba(23,37,84,0.06)] border border-slate-200/80 font-bold'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            {t.navDashboard}
          </button>
        </nav>

        {/* Vernacular Language Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F1F5F9] p-0.5 rounded-lg border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition ${language === 'en' ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(23,37,84,0.05)] font-bold' : 'text-[#64748B] hover:text-[#111827]'}`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-md transition ${language === 'hi' ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(23,37,84,0.05)] font-bold' : 'text-[#64748B] hover:text-[#111827]'}`}
              aria-label="हिन्दी में बदलें"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2 py-1 rounded-md transition ${language === 'bn' ? 'bg-white text-[#111827] shadow-[0_1px_2px_rgba(23,37,84,0.05)] font-bold' : 'text-[#64748B] hover:text-[#111827]'}`}
              aria-label="বাংলায় পরিবর্তন করুন"
            >
              বাংলা
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
