import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ScamChip from '../components/ScamChip';
import { 
  ClipboardIcon, 
  ShieldCheckIcon, 
  ZapIcon, 
  GiftIcon, 
  CoffeeIcon, 
  ArrowRightIcon, 
  SparklesIcon 
} from '../components/Icons';

export default function CheckScreen({ onCheckComplete }) {
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        setInputText(text);
      }
    } catch {
      // ignore clipboard permission error
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: inputText,
          language,
          deviceId: 'pwa_client_web'
        })
      });

      const data = await res.json();
      if (data.success) {
        onCheckComplete(data);
      } else {
        setErrorMsg(data.error || 'Failed to analyze text.');
      }
    } catch (err) {
      setErrorMsg('Could not reach TrustLayer API: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetText) => {
    setInputText(presetText);
    setTimeout(() => {
      // auto submit after small delay
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7">
      
      {/* Hero Section with Distinctive Presentation & Animated Ambient Glow */}
      <div className="relative text-center pt-2 pb-1">
        {/* Soft Animated Ambient Glow behind Hero */}
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-80 sm:w-[480px] h-32 sm:h-44 rounded-full bg-blue-500/5 blur-2xl pointer-events-none animate-ambient-pulse"
          aria-hidden="true"
        />

        {/* Security Beacon Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 shadow-[0_1px_2px_rgba(23,37,84,0.04)] text-[11px] font-semibold text-[#172554] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span>Zero-Trust UPI Threat Shield</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-display leading-tight">
          {t.checkTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
          {t.checkSubtitle}
        </p>
      </div>

      {/* Main Scam Check Card (Visually Prominent, Crisp White Surface) */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(23,37,84,0.06)]">
        {/* Fine Architectural Corner Accents */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-slate-300 pointer-events-none" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-slate-300 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-slate-300 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-slate-300 pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-[#FAFAF8] border border-slate-200/90 rounded-xl p-3.5 text-[#111827] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition resize-none font-sans placeholder:text-slate-400"
              required
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] bg-slate-200/80 text-slate-600 hover:bg-slate-300 transition"
                aria-label="Clear input text"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <button
              type="button"
              onClick={handlePaste}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ClipboardIcon className="w-3.5 h-3.5" />
              <span>{t.pasteBtn}</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-mono">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Heuristics + Gemini</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-[0_2px_10px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition flex items-center justify-center gap-2 font-display cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>{t.checking}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>{t.checkBtn}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>
      </div>

      {/* Evaluation Presets (Alternating Subtle Tone, #F1F5F9 Cool Surface) */}
      <div className="bg-[#F1F5F9]/80 rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(23,37,84,0.03)] space-y-3.5">
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs uppercase tracking-wider font-bold text-[#64748B] font-display">
            {t.presetLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <ScamChip
            icon={<ZapIcon className="w-4 h-4 text-amber-600" />}
            label="Electricity Phishing"
            subtext="Threatens power cut at 9:30 PM"
            onClick={() => loadPreset("Dear customer, your electricity power will be disconnected tonight at 9.30 PM from electricity office. Please immediately pay pending bill of ₹850 to powerbill@okaxis")}
          />
          <ScamChip
            icon={<GiftIcon className="w-4 h-4 text-rose-600" />}
            label="₹25L Lottery Scam"
            subtext="Demands advance tax fee"
            onClick={() => loadPreset("Congratulations! You won ₹25,00,000 in Special Lottery. To release your fund immediately transfer processing tax of ₹12,500 to lottery_reward99@okhdfc")}
          />
          <ScamChip
            icon={<CoffeeIcon className="w-4 h-4 text-emerald-600" />}
            label="Safe Tea Vendor"
            subtext="Verified merchant payment"
            onClick={() => loadPreset("Payment for evening tea and snacks at Ramu Tea Stall. Pay ₹45 to ramu.tea@upi")}
          />
        </div>
      </div>

    </div>
  );
}
