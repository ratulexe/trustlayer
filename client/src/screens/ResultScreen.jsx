import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import RiskGauge from '../components/RiskGauge';
import { ShieldCheck, ShieldAlert, AlertTriangle, Ban, PhoneCall, ArrowRight, ArrowLeft, Timer, Lock } from 'lucide-react';

const DEFAULT_COOLDOWN_SECONDS = 15 * 60;
const CHECKLIST_KEYS = ['cautionCheck1', 'cautionCheck2', 'cautionCheck3', 'cautionCheck4'];

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// PRD 3.2: moderate risk → checklist + cool-down + second confirmation before paying
function CautionGate({ result, onProceed }) {
  const { t } = useLanguage();
  const cooldownSeconds = result.cooldownSeconds ?? DEFAULT_COOLDOWN_SECONDS;
  const [readyAt] = useState(() => (result.receivedAt || Date.now()) + cooldownSeconds * 1000);

  const [checked, setChecked] = useState(() => CHECKLIST_KEYS.map(() => false));
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil((readyAt - Date.now()) / 1000)));
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [readyAt]);

  const allChecked = checked.every(Boolean);
  const isUnlocked = allChecked && secondsLeft === 0;

  const toggle = (i) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="space-y-3">
      {/* Safety checklist */}
      <div role="group" aria-labelledby="caution-checklist-title" className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
        <p id="caution-checklist-title" className="text-sm font-bold text-amber-900 font-display">{t.cautionChecklistTitle}</p>
        {CHECKLIST_KEYS.map((key, i) => (
          <label key={key} className="flex items-start gap-3 text-sm text-amber-950 leading-relaxed cursor-pointer">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="mt-1 w-5 h-5 shrink-0 accent-amber-600 cursor-pointer"
            />
            <span className="min-w-0">{t[key]}</span>
          </label>
        ))}
      </div>

      {/* Cool-down timer */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${
          secondsLeft > 0 ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}
        aria-live="polite"
      >
        <Timer className="w-5 h-5 shrink-0" />
        <div className="flex-1">
          <div className="font-bold font-display">{t.cooldownTitle}</div>
          <div className="opacity-90">{secondsLeft > 0 ? t.cooldownDesc : t.cooldownDone}</div>
        </div>
        {secondsLeft > 0 && (
          <span className="font-mono font-bold text-lg tabular-nums text-amber-700">{formatCountdown(secondsLeft)}</span>
        )}
      </div>

      {/* Proceed → second confirmation */}
      {!isConfirming ? (
        <button
          onClick={() => setIsConfirming(true)}
          disabled={!isUnlocked}
          className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display"
        >
          {isUnlocked ? <ArrowRight className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{isUnlocked ? t.cautionProceedBtn : t.cautionLockedBtn}</span>
        </button>
      ) : (
        <div role="alertdialog" aria-labelledby="caution-confirm-title" className="p-4 rounded-xl bg-white border-2 border-amber-400 space-y-3">
          <div>
            <div id="caution-confirm-title" className="font-bold text-sm text-slate-900 font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              {t.cautionConfirmTitle}
            </div>
            <p className="text-xs text-slate-600 mt-1">{t.cautionConfirmDesc}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsConfirming(false)}
              className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition font-display"
            >
              {t.cautionConfirmNo}
            </button>
            <button
              onClick={onProceed}
              className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition font-display"
            >
              {t.cautionConfirmYes}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultScreen({ result, onProceedToPay, onReset }) {
  const { t } = useLanguage();

  if (!result) return null;

  const { score, verdict, reasons = [], vernacularExplanation, extractedUpi, latencyMs, engine } = result;
  const isScam = verdict === 'SCAM' || score >= 70;
  const isSafe = verdict === 'SAFE' && score < 30;
  const isCaution = !isScam && !isSafe;

  const StatusIcon = isScam ? ShieldAlert : isSafe ? ShieldCheck : AlertTriangle;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Risk Gauge Visual Card */}
      <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-card space-y-6">

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
            <StatusIcon className="w-4 h-4 shrink-0" />
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
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Telemetry info */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-100 pt-3">
          <span>Engine: <strong className="text-slate-600">{engine || 'Heuristic Shield'}</strong></span>
          <span>Latency: <strong className="text-brand-600">{latencyMs || 18}ms</strong></span>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 pt-2">
          {isSafe && (
            <button
              onClick={() => onProceedToPay(extractedUpi)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display"
            >
              <span>{t.proceedToPay}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {isCaution && (
            <CautionGate
              key={result.checkId || result.receivedAt}
              result={result}
              onProceed={() => onProceedToPay(extractedUpi, { cautionAcknowledged: true })}
            />
          )}

          {isScam && (
            <div className="space-y-2">
              <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-center text-xs text-rose-800 font-bold flex items-center justify-center gap-2">
                <Ban className="w-4 h-4" />
                <span>{t.paymentBlocked}</span>
              </div>
              <a
                href="tel:1930"
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 font-display"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t.reportScam}</span>
              </a>
            </div>
          )}

          <button
            onClick={onReset}
            className="w-full py-2.5 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToCheck}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
