import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheckIcon, ShieldAlertIcon, AlertTriangleIcon } from './Icons';

export default function RiskGauge({ score = 0, verdict = 'SAFE' }) {
  const { t } = useLanguage();

  const isScam = verdict === 'SCAM' || score >= 70;
  const isCaution = !isScam && (verdict === 'CAUTION' || score >= 30);

  const colorClass = isScam
    ? { 
        text: 'text-rose-600', 
        bg: 'bg-rose-500', 
        pillBg: 'bg-rose-50', 
        pillBorder: 'border-rose-200', 
        pillText: 'text-rose-700',
        trackGlow: 'shadow-[0_0_12px_rgba(239,68,68,0.2)]'
      }
    : isCaution
    ? { 
        text: 'text-amber-600', 
        bg: 'bg-amber-500', 
        pillBg: 'bg-amber-50', 
        pillBorder: 'border-amber-200', 
        pillText: 'text-amber-700',
        trackGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.2)]'
      }
    : { 
        text: 'text-emerald-600', 
        bg: 'bg-emerald-500', 
        pillBg: 'bg-emerald-50', 
        pillBorder: 'border-emerald-200', 
        pillText: 'text-emerald-700',
        trackGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]'
      };

  const verdictLabel = isScam ? t.scamVerdict : isCaution ? t.cautionVerdict : t.safeVerdict;

  return (
    <div className="relative flex flex-col items-center p-6 bg-[#FAFAF8] border border-slate-200/90 rounded-2xl w-full shadow-[0_1px_4px_rgba(23,37,84,0.03)] overflow-hidden">
      {/* Subtle Top Accent Hairline */}
      <div className={`absolute top-0 inset-x-0 h-1 ${colorClass.bg}`} />

      <span className="text-xs uppercase tracking-wider text-[#64748B] font-semibold mb-2 font-display">
        {t.riskScore}
      </span>

      {/* Large Score Display */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`text-6xl font-black font-mono tracking-tight ${colorClass.text}`}>
          {score}
        </span>
        <span className="text-sm font-mono text-[#64748B]">/ 100</span>
      </div>

      {/* Linear Meter */}
      <div className="w-full max-w-xs bg-slate-200/80 h-2.5 rounded-full overflow-hidden my-3 border border-slate-200/60 p-0.5">
        <div
          className={`h-full rounded-full ${colorClass.bg} ${colorClass.trackGlow} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(5, Math.min(100, score))}%` }}
        />
      </div>

      {/* Verdict Pill with SVG Icon */}
      <div className={`mt-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-display border flex items-center gap-2 ${colorClass.pillBg} ${colorClass.pillBorder} ${colorClass.pillText}`}>
        {isScam ? (
          <ShieldAlertIcon className="w-4 h-4 shrink-0" />
        ) : isCaution ? (
          <AlertTriangleIcon className="w-4 h-4 shrink-0" />
        ) : (
          <ShieldCheckIcon className="w-4 h-4 shrink-0" />
        )}
        <span>{verdictLabel}</span>
      </div>
    </div>
  );
}
