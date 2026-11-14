import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { PhoneCall, LogIn, LogOut, ChevronDown, Wallet } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'EN', aria: 'Switch to English' },
  { code: 'hi', label: 'हिन्दी', aria: 'Switch to Hindi' },
  { code: 'bn', label: 'বাংলা', aria: 'Switch to Bengali' }
];

function UserMenu({ onOpenMoney }) {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-[#D4E0D5] bg-white p-0.5 pr-2 hover:border-[#059669] transition"
      >
        {user.photo ? (
          <img src={user.photo} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-[#059669] text-white flex items-center justify-center text-sm font-bold">{initial}</span>
        )}
        <ChevronDown className="w-4 h-4 text-[#5C6B63]" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 rounded-2xl sage-card p-2 z-50">
          <div className="px-3 py-2 border-b border-[#E2EAE3] mb-1">
            <div className="text-xs text-[#5C6B63]">{t.signedInAs}</div>
            <div className="text-sm font-bold text-[#0F1F17] truncate">{user.name || user.email}</div>
            {user.name && user.email && <div className="text-xs text-[#5C6B63] truncate">{user.email}</div>}
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenMoney();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#0F1F17] hover:bg-[#F3F6F4]"
          >
            <Wallet className="w-4 h-4 text-amber-600" />
            {t.navMoney}
          </button>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[#0F1F17] hover:bg-[#F3F6F4]"
          >
            <LogOut className="w-4 h-4 text-[#5C6B63]" />
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Header({ onHome, onOpenMoney }) {
  const { language, setLanguage, t } = useLanguage();
  const { status, user, signIn, error } = useAuth();

  const cycleLanguage = () => {
    const i = LANGUAGES.findIndex((l) => l.code === language);
    setLanguage(LANGUAGES[(i + 1) % LANGUAGES.length].code);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#D4E0D5] bg-white/90 backdrop-blur-md shadow-[0_1px_3px_rgba(15,31,23,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand → Home */}
        <button type="button" onClick={onHome} className="flex items-center gap-3 group shrink-0 min-w-0 text-left" aria-label={`TrustLayer · ${t.home}`}>
          <span className="relative w-10 h-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(5,150,105,0.25)] border border-[#047857] transition group-hover:bg-[#047857] group-hover:scale-105">
            <span className="tracking-tight font-extrabold text-sm">TL</span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#A7F3D0] animate-pulse" />
          </span>
          <span className="min-w-0 hidden min-[420px]:block">
            <span className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0F1F17]">TrustLayer</span>
              <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full bg-[#E6F7EF] text-[#047857] border border-[#A7F3D0] font-mono font-semibold tracking-wider uppercase">
                FinTech Rail
              </span>
            </span>
            <span className="text-[11px] text-[#5C6B63] hidden md:block leading-none mt-0.5 font-medium">{t.brandTag}</span>
          </span>
        </button>

        {/* Utilities */}
        <div className="flex items-center gap-2">
          <span className="hidden xl:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
            <span className="font-semibold">{t.engineStatus}</span>
          </span>

          <a
            href="tel:1930"
            aria-label={t.helplineAria}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] hover:bg-[#FFD5DA] font-bold text-sm transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden md:inline">{t.helpline}</span>
            <span className="md:hidden">1930</span>
          </a>

          {/* Language: segmented control on larger screens, one tap to cycle on phones */}
          <div className="hidden sm:flex items-center bg-[#EAF0EB] p-0.5 rounded-xl border border-[#D4E0D5] text-xs font-semibold" role="group" aria-label={t.languageLabel}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                aria-pressed={language === l.code}
                aria-label={l.aria}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  language === l.code ? 'bg-white text-[#0F1F17] shadow-xs font-bold border border-[#D4E0D5]' : 'text-[#5C6B63] hover:text-[#0F1F17]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={cycleLanguage}
            aria-label={t.languageLabel}
            className="sm:hidden h-10 px-3 rounded-xl bg-[#EAF0EB] text-[#0F1F17] text-sm font-bold border border-[#D4E0D5]"
          >
            {LANGUAGES.find((l) => l.code === language)?.label}
          </button>

          {status === 'ready' && !user && (
            <button
              type="button"
              onClick={signIn}
              className="flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-[0_2px_10px_rgba(5,150,105,0.25)] border border-[#047857] transition"
              title={t.signInGoogle}
              aria-label={t.signInGoogle}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t.signIn}</span>
            </button>
          )}
          {status === 'ready' && user && <UserMenu onOpenMoney={onOpenMoney} />}
          {status === 'loading' && <span className="w-10 h-10 rounded-full bg-[#EAF0EB] animate-pulse" aria-hidden="true" />}
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-[#FFE4E6] border-t border-[#FECDD3] text-[#BE123C] text-sm text-center px-4 py-2">
          {error === 'unauthorized-domain' ? t.signInDomain : t.signInFailed}
        </div>
      )}
    </header>
  );
}
