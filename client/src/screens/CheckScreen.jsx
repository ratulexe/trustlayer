import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import ScamChip from '../components/ScamChip';

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
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
          {t.checkTitle}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {t.checkSubtitle}
        </p>
      </div>

      {/* Main Check Card */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-200 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition resize-none font-sans"
              required
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[11px] bg-slate-200 text-slate-600 hover:bg-slate-300 transition"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handlePaste}
              className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1.5 transition"
            >
              <span>📋</span>
              <span>{t.pasteBtn}</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              Dual-Engine: Heuristics + Gemini
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-float hover:shadow-lg transition flex items-center justify-center gap-2 font-display"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>{t.checking}</span>
              </span>
            ) : (
              <span>{t.checkBtn} →</span>
            )}
          </button>

        </form>
      </div>

      {/* 10:30 AM Evaluation Preset Scenarios */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-200 shadow-subtle space-y-3">
        <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-display block">
          {t.presetLabel}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <ScamChip
            emoji="⚡"
            label="Electricity Phishing"
            subtext="Threatens power disconnection at 9:30 PM"
            onClick={() => loadPreset("Dear customer, your electricity power will be disconnected tonight at 9.30 PM from electricity office. Please immediately pay pending bill of ₹850 to powerbill@okaxis")}
          />
          <ScamChip
            emoji="🎁"
            label="₹25L Lottery Scam"
            subtext="Demands processing fee to claim prize"
            onClick={() => loadPreset("Congratulations! You won ₹25,00,000 in Special Lottery. To release your fund immediately transfer processing tax of ₹12,500 to lottery_reward99@okhdfc")}
          />
          <ScamChip
            emoji="☕"
            label="Safe Tea Vendor"
            subtext="Verified street food merchant"
            onClick={() => loadPreset("Payment for evening tea and snacks at Ramu Tea Stall. Pay ₹45 to ramu.tea@upi")}
          />
        </div>
      </div>

    </div>
  );
}
