import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Mail, Lock, User, LogIn, UserPlus, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, initialMode = 'signup', onClose }) {
  const { t } = useLanguage();
  const { createAccount, signInWithEmail, signInWithGoogle, signInAsDemo } = useAuth();

  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode whenever modal opens with initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'signup');
      setError('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError(t.nameRequired || 'Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError(t.emailRequired || 'Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError(t.passwordLength || 'Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError(t.passwordMismatch || 'Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        await createAccount({ name, email, password });
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to create account. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Sign in mode
      if (!email.trim() || !email.includes('@')) {
        setError(t.emailRequired || 'Please enter a valid email address.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        await signInWithEmail({ email, password });
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to sign in. Please verify your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || t.signInFailed || 'Google sign-in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    signInAsDemo();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 bg-black/75 backdrop-blur-md flex min-h-screen items-center justify-center animate-fade-in"
    >
      {/* Backdrop Click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-white dark:bg-[#0E1A13] border border-[#D4E0D5] dark:border-[#1E3326] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] z-10 animate-bounce-in overflow-hidden flex flex-col max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-xl text-[#5C6B63] hover:text-[#0F1F17] dark:hover:text-white hover:bg-[#F3F6F4] dark:hover:bg-[#1A2E22] transition z-20"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-7 space-y-3.5">
          {/* Modal Header */}
          <div className="text-center space-y-1.5 pr-6 pl-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#059669] text-white shadow-[0_2px_10px_rgba(5,150,105,0.3)] border border-[#047857]">
              <span className="font-extrabold text-sm tracking-tight">TL</span>
            </div>
            <h2 id="auth-modal-title" className="text-lg sm:text-xl font-black text-[#0F1F17] dark:text-white tracking-tight">
              {mode === 'signup' ? t.createAccountTitle : t.signInTitle}
            </h2>
            <p className="text-xs text-[#5C6B63] dark:text-[#9EB3A6] leading-relaxed">
              {mode === 'signup' ? t.createAccountSub : t.signInSub}
            </p>
          </div>

          {/* Tabs: Sign In / Create Account */}
          <div className="flex bg-[#EAF0EB] dark:bg-[#132219] p-1 rounded-xl border border-[#D4E0D5] dark:border-[#22382B]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => {
                setMode('signin');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-[#1E3326] text-[#0F1F17] dark:text-white shadow-xs border border-[#D4E0D5] dark:border-transparent'
                  : 'text-[#5C6B63] dark:text-[#9EB3A6] hover:text-[#0F1F17] dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signIn}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-[#1E3326] text-[#0F1F17] dark:text-white shadow-xs border border-[#D4E0D5] dark:border-transparent'
                  : 'text-[#5C6B63] dark:text-[#9EB3A6] hover:text-[#0F1F17] dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.createAccount}</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div role="alert" className="flex items-start gap-2 p-2.5 rounded-xl bg-[#FFE4E6] dark:bg-rose-950/40 border border-[#FECDD3] dark:border-rose-900/60 text-[#BE123C] dark:text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#0F1F17] dark:text-[#E2EAE3] mb-1">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6B63] dark:text-[#9EB3A6]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F7FAF8] dark:bg-[#132219] border border-[#D4E0D5] dark:border-[#22382B] text-xs sm:text-sm text-[#0F1F17] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#5C6B63] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#0F1F17] dark:text-[#E2EAE3] mb-1">
                {t.emailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6B63] dark:text-[#9EB3A6]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F7FAF8] dark:bg-[#132219] border border-[#D4E0D5] dark:border-[#22382B] text-xs sm:text-sm text-[#0F1F17] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#5C6B63] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#0F1F17] dark:text-[#E2EAE3] mb-1">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6B63] dark:text-[#9EB3A6]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F7FAF8] dark:bg-[#132219] border border-[#D4E0D5] dark:border-[#22382B] text-xs sm:text-sm text-[#0F1F17] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#5C6B63] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#0F1F17] dark:text-[#E2EAE3] mb-1">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C6B63] dark:text-[#9EB3A6]" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#F7FAF8] dark:bg-[#132219] border border-[#D4E0D5] dark:border-[#22382B] text-xs sm:text-sm text-[#0F1F17] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#5C6B63] focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] transition"
                  />
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-[0_2px_12px_rgba(5,150,105,0.25)] transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            >
              {mode === 'signup' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? '...' : t.createAccount}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? '...' : t.signIn}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2EAE3] dark:border-[#1E3326]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-white dark:bg-[#0E1A13] px-2.5 text-[#5C6B63] dark:text-[#9EB3A6] font-semibold">
                {t.orContinueWith}
              </span>
            </div>
          </div>

          {/* Alternative Auth Actions */}
          <div className="space-y-2">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 h-10 px-4 rounded-xl bg-white dark:bg-[#132219] hover:bg-[#F7FAF8] dark:hover:bg-[#1A2E22] text-[#0F1F17] dark:text-white font-bold text-xs sm:text-sm border border-[#D4E0D5] dark:border-[#22382B] shadow-xs transition active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t.signInGoogle}</span>
            </button>

            {/* Quick Demo Access */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#E6F7EF] dark:bg-emerald-950/40 hover:bg-[#D1FAE5] dark:hover:bg-emerald-900/50 text-[#047857] dark:text-[#34D399] font-bold text-xs sm:text-sm border border-[#A7F3D0] dark:border-emerald-800 transition active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-[#059669] dark:text-[#34D399] shrink-0" />
              <span>{t.demoAccountBtn}</span>
            </button>
          </div>

          {/* Footer Mode Switcher Link */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError('');
              }}
              className="text-xs font-semibold text-[#059669] dark:text-[#34D399] hover:underline"
            >
              {mode === 'signup' ? t.switchToSignIn : t.switchToSignUp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
