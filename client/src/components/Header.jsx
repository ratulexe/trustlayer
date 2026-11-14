import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { MenuIcon, XIcon, ShieldCheckIcon } from './Icons';

export default function Header({ currentScreen, setCurrentScreen }) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCheckActive = currentScreen === 'check' || currentScreen === 'result';

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 transition-all border-b border-[#D4E0D5] bg-white/90 backdrop-blur-md shadow-[0_1px_3px_rgba(15,31,23,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Shield Crest + Wordmark + FinTech Rail Badge */}
        <div 
          onClick={() => navigateTo('check')} 
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigateTo('check'); }}
          aria-label="TrustLayer Home"
        >
          {/* Deep Emerald Shield Squircle */}
          <div className="relative w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center font-bold text-sm shadow-[0_2px_10px_rgba(5,150,105,0.25)] border border-[#047857] font-sans transition group-hover:bg-[#047857] group-hover:scale-105">
            <span className="tracking-tight font-extrabold text-sm">TL</span>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#A7F3D0] animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#0F1F17] font-sans">
                TrustLayer
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E6F7EF] text-[#047857] border border-[#A7F3D0] font-mono font-semibold tracking-wider uppercase">
                FinTech Rail
              </span>
            </div>
            <p className="text-[11px] text-[#5C6B63] hidden md:block leading-none mt-0.5 font-sans font-medium">
              {t.brandTag}
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Crisp Sage Pill Control) */}
        <nav className="hidden lg:flex items-center bg-[#EAF0EB] p-1 rounded-2xl border border-[#D4E0D5] relative">
          <button
            onClick={() => navigateTo('check')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isCheckActive
                ? 'bg-white text-[#0F1F17] shadow-[0_2px_8px_rgba(15,31,23,0.06)] border border-[#D4E0D5] font-bold'
                : 'text-[#5C6B63] hover:text-[#0F1F17] hover:bg-white/60'
            }`}
          >
            {t.navCheck}
          </button>
          
          <button
            onClick={() => navigateTo('pay')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentScreen === 'pay'
                ? 'bg-white text-[#0F1F17] shadow-[0_2px_8px_rgba(15,31,23,0.06)] border border-[#D4E0D5] font-bold'
                : 'text-[#5C6B63] hover:text-[#0F1F17] hover:bg-white/60'
            }`}
          >
            {t.navPay}
          </button>
          
          <button
            onClick={() => navigateTo('feed')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentScreen === 'feed'
                ? 'bg-white text-[#0F1F17] shadow-[0_2px_8px_rgba(15,31,23,0.06)] border border-[#D4E0D5] font-bold'
                : 'text-[#5C6B63] hover:text-[#0F1F17] hover:bg-white/60'
            }`}
          >
            {t.navFeed}
          </button>

          <button
            onClick={() => navigateTo('impact')}
            className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentScreen === 'impact'
                ? 'bg-white text-[#0F1F17] shadow-[0_2px_8px_rgba(15,31,23,0.06)] border border-[#D4E0D5] font-bold'
                : 'text-[#5C6B63] hover:text-[#0F1F17] hover:bg-white/60'
            }`}
          >
            {t.navImpact}
          </button>
        </nav>

        {/* Right: Live Engine Status Beacon + Trilingual Switcher */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Live Engine Status Beacon */}
          <div className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="font-semibold">{t.engineStatus}</span>
          </div>

          {/* Trilingual Language Switcher */}
          <div className="flex items-center bg-[#EAF0EB] p-0.5 rounded-xl border border-[#D4E0D5] text-xs font-semibold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en' 
                  ? 'bg-white text-[#0F1F17] shadow-xs font-bold border border-[#D4E0D5]' 
                  : 'text-[#5C6B63] hover:text-[#0F1F17]'
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'hi' 
                  ? 'bg-white text-[#0F1F17] shadow-xs font-bold border border-[#D4E0D5]' 
                  : 'text-[#5C6B63] hover:text-[#0F1F17]'
              }`}
              aria-label="Switch to Hindi"
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'bn' 
                  ? 'bg-white text-[#0F1F17] shadow-xs font-bold border border-[#D4E0D5]' 
                  : 'text-[#5C6B63] hover:text-[#0F1F17]'
              }`}
              aria-label="Switch to Bengali"
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => {
              if (language === 'en') setLanguage('hi');
              else if (language === 'hi') setLanguage('bn');
              else setLanguage('en');
            }}
            className="px-2.5 py-1 rounded-lg bg-[#EAF0EB] text-[#0F1F17] text-xs font-mono border border-[#D4E0D5]"
          >
            {language.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#EAF0EB] border border-[#D4E0D5] text-[#0F1F17] hover:bg-white transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#D4E0D5] bg-white px-4 py-4 space-y-2 animate-fade-in shadow-xl">
          <button
            onClick={() => navigateTo('check')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              isCheckActive 
                ? 'bg-[#E6F7EF] text-[#047857] font-bold border border-[#A7F3D0]' 
                : 'text-[#5C6B63] hover:bg-[#F3F6F4]'
            }`}
          >
            {t.navCheck}
          </button>
          <button
            onClick={() => navigateTo('pay')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentScreen === 'pay' 
                ? 'bg-[#E6F7EF] text-[#047857] font-bold border border-[#A7F3D0]' 
                : 'text-[#5C6B63] hover:bg-[#F3F6F4]'
            }`}
          >
            {t.navPay}
          </button>
          <button
            onClick={() => navigateTo('feed')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentScreen === 'feed' 
                ? 'bg-[#E6F7EF] text-[#047857] font-bold border border-[#A7F3D0]' 
                : 'text-[#5C6B63] hover:bg-[#F3F6F4]'
            }`}
          >
            {t.navFeed}
          </button>
          <button
            onClick={() => navigateTo('impact')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              currentScreen === 'impact' 
                ? 'bg-[#E6F7EF] text-[#047857] font-bold border border-[#A7F3D0]' 
                : 'text-[#5C6B63] hover:bg-[#F3F6F4]'
            }`}
          >
            {t.navImpact}
          </button>

          <div className="pt-3 border-t border-[#D4E0D5] flex items-center justify-between">
            <span className="text-xs text-[#5C6B63]">Select Language:</span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-2.5 py-1 text-xs rounded-lg ${language === 'en' ? 'bg-[#059669] text-white font-bold' : 'text-[#5C6B63] bg-[#EAF0EB]'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('hi')} 
                className={`px-2.5 py-1 text-xs rounded-lg ${language === 'hi' ? 'bg-[#059669] text-white font-bold' : 'text-[#5C6B63] bg-[#EAF0EB]'}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => setLanguage('bn')} 
                className={`px-2.5 py-1 text-xs rounded-lg ${language === 'bn' ? 'bg-[#059669] text-white font-bold' : 'text-[#5C6B63] bg-[#EAF0EB]'}`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
