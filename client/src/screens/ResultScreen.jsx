import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import RiskGauge from '../components/RiskGauge';
import { 
  ShieldCheckIcon, 
  ShieldAlertIcon, 
  ShieldBanIcon, 
  AlertTriangleIcon, 
  PhoneCallIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon 
} from '../components/Icons';

export default function ResultScreen({ result, onProceedToPay, onReset }) {
  const { t } = useLanguage();

  if (!result) return null;

  const { score, verdict, reasons = [], vernacularExplanation, extractedUpi, latencyMs, engine } = result;
  const isScam = verdict === 'SCAM' || score >= 70;
  const isSafe = verdict === 'SAFE' && score < 30;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Risk Gauge Visual Card */}
      <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(23,37,84,0.06)] space-y-6">
        
        <RiskGauge score={score} verdict={verdict} />

        {/* Vernacular Explanation Box with Clean Icons */}
        <div className={`p-4 rounded-xl border text-sm font-sans ${
          isScam 
            ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
            : isSafe 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1 font-display">
            {isScam ? (
              <ShieldAlertIcon className="w-4 h-4 text-rose-600 shrink-0" />
            ) : isSafe ? (
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span>{isScam ? t.scamSubtitle : isSafe ? t.safeSubtitle : t.cautionSubtitle}</span>
          </div>
          <p className="text-xs leading-relaxed mt-1 opacity-90">
            {vernacularExplanation}
          </p>
        </div>

        {/* Reasons & Signals List */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] font-display">
              {t.reasonsHeader}
            </h4>
            <div className="space-y-2">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F1F5F9]/80 border border-slate-200/70 text-xs text-[#111827]">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Telemetry info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] border-t border-slate-200/70 pt-3">
          <span>{t.engineLabel}: <strong className="text-[#111827]">{engine || 'Dual-Engine Heuristic'}</strong></span>
          <span>{t.latencyLabel}: <strong className="text-blue-600 font-bold">{latencyMs || 18}ms</strong></span>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5 pt-1">
          {!isScam ? (
            <button
              onClick={() => onProceedToPay(extractedUpi)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-[0_2px_10px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition flex items-center justify-center gap-2 font-display cursor-pointer"
            >
              <span>{t.proceedToPay}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="p-3.5 bg-rose-100/80 border border-rose-300 rounded-xl text-center text-xs text-rose-900 font-bold flex items-center justify-center gap-2">
                <ShieldBanIcon className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{t.paymentBlockedAlert}</span>
              </div>
              <a
                href="tel:1930"
                className="w-full py-3 rounded-xl bg-[#F1F5F9] hover:bg-slate-200 border border-slate-300 text-[#111827] font-bold text-xs transition flex items-center justify-center gap-2 font-display"
              >
                <PhoneCallIcon className="w-4 h-4 text-slate-700" />
                <span>{t.reportScam}</span>
              </a>
            </div>
          )}

          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl text-[#64748B] hover:text-[#111827] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t.backToCheck}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
