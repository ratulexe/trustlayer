import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Shield, PhoneCall, Globe, LogIn, LogOut, ChevronDown, Wallet } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' }
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
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-0.5 pr-2 hover:border-brand-200 transition"
      >
        {user.photo ? (
          <img src={user.photo} alt="" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-sm font-bold">{initial}</span>
        )}
        <ChevronDown className="w-4 h-4 text-slate-500" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-card p-2 z-50">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <div className="text-xs text-slate-500">{t.signedInAs}</div>
            <div className="text-sm font-bold text-slate-900 truncate">{user.name || user.email}</div>
            {user.name && user.email && <div className="text-xs text-slate-500 truncate">{user.email}</div>}
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenMoney();
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
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
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
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

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand → home */}
        <button type="button" onClick={onHome} className="flex items-center gap-2.5 min-w-0 text-left" aria-label={`TrustLayer · ${t.home}`}>
          <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white flex items-center justify-center shadow-float">
            <Shield className="w-5 h-5" />
          </span>
          <span className="min-w-0 hidden min-[400px]:block">
            <span className="block font-bold text-lg leading-tight tracking-tight text-slate-900 font-display">TrustLayer</span>
            <span className="hidden sm:block text-xs text-slate-500 truncate">{t.brandTag}</span>
          </span>
        </button>

        {/* Utilities */}
        <div className="flex items-center gap-2">
          <a
            href="tel:1930"
            aria-label={t.helplineAria}
            className="flex items-center gap-1.5 h-10 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-sm transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden md:inline">{t.helpline}</span>
            <span className="md:hidden">1930</span>
          </a>

          <label className="relative flex items-center h-10 rounded-xl border border-slate-200 bg-white hover:border-brand-200 transition">
            <Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" />
            <span className="sr-only">{t.languageLabel}</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="appearance-none bg-transparent h-full pl-8 pr-7 text-sm font-semibold text-slate-800 rounded-xl focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" />
          </label>

          {status === 'ready' && !user && (
            <button
              type="button"
              onClick={signIn}
              className="flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-float transition"
              title={t.signInGoogle}
              aria-label={t.signInGoogle}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">{t.signIn}</span>
            </button>
          )}
          {status === 'ready' && user && <UserMenu onOpenMoney={onOpenMoney} />}
          {status === 'loading' && <span className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" aria-hidden="true" />}
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-rose-50 border-t border-rose-200 text-rose-700 text-sm text-center px-4 py-2">
          {error === 'unauthorized-domain' ? t.signInDomain : t.signInFailed}
        </div>
      )}
    </header>
  );
}
