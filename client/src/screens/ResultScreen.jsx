import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import RiskGauge from '../components/RiskGauge';

export default function ResultScreen({ result, onProceedToPay, onReset }) {
  const { t } = useLanguage();

  if (!result) return null;

  const { score, verdict, reasons = [], vernacularExplanation, extractedUpi, latencyMs, engine } = result;
  const isScam = verdict === 'SCAM' || score >= 70;
  const isSafe = verdict === 'SAFE' && score < 30;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Risk Gauge Visual Card */}
      <div className="bg-surface rounded-2xl p-6 border border-slate-200 shadow-card space-y-6">
        
        <RiskGauge score={score} verdict={verdict} />

        {/* Vernacular Explanation Box */}
        <div className={`p-4 rounded-xl border text-sm font-sans ${
          isScam 
            ? 'bg-rose-50 border-rose-200 text-rose-900' 
            : isSafe 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1 font-display">
            <span>{isScam ? '🚨' : isSafe ? '🛡️' : '⚠️'}</span>
            <span>{isScam ? t.scamSubtitle : isSafe ? t.safeSubtitle : t.cautionSubtitle}</span>
          </div>
          <p className="text-xs leading-relaxed mt-1 opacity-90">
            {vernacularExplanation}
          </p>
        </div>

        {/* Reasons & Signals List */}
        {reasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
              {t.reasonsHeader}
            </h4>
            <div className="space-y-1.5">
              {reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="text-slate-400 font-bold shrink-0">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Telemetry info */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-100 pt-3">
          <span>Engine: <strong className="text-slate-600">{engine || 'Heuristic Shield'}</strong></span>
          <span>Latency: <strong className="text-brand-600">{latencyMs || 18}ms</strong></span>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-2">
          {!isScam ? (
            <button
              onClick={() => onProceedToPay(extractedUpi)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display"
            >
              <span>{t.proceedToPay}</span>
              <span>→</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-center text-xs text-rose-800 font-bold">
                ⛔ Payment Blocked by TrustLayer for Consumer Protection
              </div>
              <a
                href="tel:1930"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 font-display"
              >
                <span>📞</span>
                <span>{t.reportScam}</span>
              </a>
            </div>
          )}

          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold transition"
          >
            ← {t.backToCheck}
          </button>
        </div>

      </div>

    </div>
  );
}
