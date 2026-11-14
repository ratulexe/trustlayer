import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function RiskGauge({ score = 0, verdict = 'SAFE' }) {
  const { t } = useLanguage();

  const isScam = verdict === 'SCAM' || score >= 70;
  const isCaution = !isScam && (verdict === 'CAUTION' || score >= 30);
  const isSafe = !isScam && !isCaution;

  const colorClass = isScam
    ? { text: 'text-rose-600', bg: 'bg-rose-500', pillBg: 'bg-rose-50', pillBorder: 'border-rose-200', pillText: 'text-rose-700' }
    : isCaution
    ? { text: 'text-amber-600', bg: 'bg-amber-500', pillBg: 'bg-amber-50', pillBorder: 'border-amber-200', pillText: 'text-amber-700' }
    : { text: 'text-emerald-600', bg: 'bg-emerald-500', pillBg: 'bg-emerald-50', pillBorder: 'border-emerald-200', pillText: 'text-emerald-700' };

  const verdictLabel = isScam ? t.scamVerdict : isCaution ? t.cautionVerdict : t.safeVerdict;

  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 border border-slate-200 rounded-2xl w-full">
      <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
        {t.riskScore}
      </span>

      {/* Large Score Display */}
      <div className="flex items-baseline gap-1 my-1">
        <span className={`text-6xl font-black font-mono tracking-tight ${colorClass.text}`}>
          {score}
        </span>
        <span className="text-sm font-mono text-slate-400">/ 100</span>
      </div>

      {/* Linear Meter */}
      <div className="w-full max-w-xs bg-slate-200 h-2.5 rounded-full overflow-hidden my-3">
        <div
          className={`h-full ${colorClass.bg} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>

      {/* Verdict Pill */}
      <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-bold font-display border ${colorClass.pillBg} ${colorClass.pillBorder} ${colorClass.pillText}`}>
        {verdictLabel}
      </div>
    </div>
  );
}
