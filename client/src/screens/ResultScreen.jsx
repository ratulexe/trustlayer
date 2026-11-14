import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceId } from '../utils/deviceId';
import RiskGauge from '../components/RiskGauge';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Ban,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Lock,
  Flag,
  CheckCircle,
  CheckCircle2,
  QrCode,
  Clock
} from 'lucide-react';

const CHECKLIST_KEYS = ['cautionCheck1', 'cautionCheck2', 'cautionCheck3', 'cautionCheck4'];

function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function dedupeReasons(list) {
  if (!Array.isArray(list)) return [];
  const cleaned = [];
  const seen = [];
  for (const item of list) {
    if (!item || typeof item !== 'string') continue;
    const norm = item.trim().toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const isDup = seen.some((s) => s === norm || (s.length > 15 && norm.length > 15 && (s.includes(norm) || norm.includes(s))));
    if (!isDup) {
      seen.push(norm);
      cleaned.push(item.trim());
    }
  }
  return cleaned;
}

// PRD 3.2: Moderate risk (Caution) Gate: Prominent Safety Cool-down Timer + Checklist
// MUST be confirmed before the final Payment Verdict is unlocked.
function CautionGate({ result, onProceed, isQr = false }) {
  const { t } = useLanguage();
  const defaultCooldown = 20;
  const cooldownSeconds = Math.max(
    1,
    typeof result?.cooldownSeconds === 'number' && result.cooldownSeconds > 0
      ? result.cooldownSeconds
      : defaultCooldown
  );
  const [readyAt] = useState(() => (result?.receivedAt || Date.now()) + cooldownSeconds * 1000);

  const [checked, setChecked] = useState(() => CHECKLIST_KEYS.map(() => false));
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil((readyAt - Date.now()) / 1000)));
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    let id;
    const tick = () => {
      const left = Math.max(0, Math.ceil((readyAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0 && id) clearInterval(id);
    };
    id = setInterval(tick, 250);
    return () => {
      if (id) clearInterval(id);
    };
  }, [readyAt]);

  const checkedCount = checked.filter(Boolean).length;
  const allChecked = checked.every(Boolean);
  const isUnlocked = allChecked && secondsLeft === 0;
  const progressPercent = Math.min(100, Math.max(0, ((cooldownSeconds - secondsLeft) / cooldownSeconds) * 100));

  const toggle = (i) => setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="space-y-4">
      {/* 1. PROMINENT LIVE SAFETY COOL-DOWN TIMER */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          secondsLeft > 0
            ? 'bg-amber-500/10 border-amber-300/80 text-amber-950 shadow-sm'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
        }`}
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${secondsLeft > 0 ? 'bg-amber-500/20 text-amber-700 animate-pulse' : 'bg-emerald-500/20 text-emerald-700'}`}>
              {secondsLeft > 0 ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-bold text-sm font-display flex items-center gap-1.5">
                <span>{secondsLeft > 0 ? (t.qrTimerActive || t.cooldownTitle) : (t.cooldownDone || 'Cool-down complete')}</span>
                {secondsLeft > 0 && (
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 mt-0.5 leading-snug">
                {secondsLeft > 0 ? (t.qrTimerActiveDesc || t.cooldownDesc) : (t.qrTimerComplete || t.cooldownDone)}
              </p>
            </div>
          </div>
          {secondsLeft > 0 ? (
            <div className="text-right shrink-0">
              <span className="font-mono font-extrabold text-2xl sm:text-3xl tabular-nums text-amber-700 block leading-none">
                {formatCountdown(secondsLeft)}
              </span>
              <span className="text-[10px] text-amber-800/80 font-medium font-sans">
                {t.qrTimerSecondsLeft ? t.qrTimerSecondsLeft.replace('{seconds}', secondsLeft) : `${secondsLeft}s left`}
              </span>
            </div>
          ) : (
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-800 text-xs font-bold font-sans">
              ✓ Ready
            </span>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-3" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              secondsLeft > 0 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. VERIFICATION CHECKLIST (Must be confirmed before unlocking payment) */}
      <div role="group" aria-labelledby="caution-checklist-title" className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#D4E0D5] space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#E2EAE3] pb-2.5">
          <p id="caution-checklist-title" className="text-xs sm:text-sm font-bold text-[#0F1F17] font-display">
            {t.qrChecklistTitle || t.cautionChecklistTitle}
          </p>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            allChecked ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {t.qrChecklistProgress
              ? t.qrChecklistProgress.replace('{done}', checkedCount).replace('{total}', CHECKLIST_KEYS.length)
              : `${checkedCount}/${CHECKLIST_KEYS.length}`}
          </span>
        </div>

        <div className="space-y-2.5 pt-0.5">
          {CHECKLIST_KEYS.map((key, i) => (
            <label
              key={key}
              className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs sm:text-sm leading-relaxed cursor-pointer transition select-none ${
                checked[i]
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-[#0F1F17]'
                  : 'bg-white border-[#E2EAE3] text-[#24352C] hover:bg-[#F3F6F4]'
              }`}
            >
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 shrink-0 accent-emerald-600 rounded cursor-pointer"
              />
              <span className="min-w-0 font-medium">{t[key]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. DYNAMIC PAYMENT VERDICT (Held until Checklist + Cooldown are complete) */}
      <div className={`p-4 rounded-2xl border-2 transition-all ${
        isUnlocked
          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${isUnlocked ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
            {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-75 font-mono">
              {t.qrPaymentVerdict || "PAYMENT DECISION VERDICT"}
            </div>
            <h3 className="text-sm sm:text-base font-bold font-display mt-0.5">
              {isUnlocked
                ? (t.qrVerdictCautionUnlocked || "PAYMENT UNLOCKED — PROCEED WITH CAUTION")
                : (t.qrVerdictCautionHeld || "PAYMENT HELD — VERIFY FIRST")}
            </h3>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              {isUnlocked
                ? (t.qrVerdictCautionUnlockedDesc || "You verified the safety checklist and completed the cool-down. Only pay if you personally trust this recipient.")
                : !allChecked && secondsLeft > 0
                ? (isQr
                    ? (t.qrVerdictCautionHeldDesc || "This QR pays an unverified individual. Complete the safety checklist and wait for the cool-down timer to unlock payment.")
                    : (t.cautionHeldMessage || "This message asks to pay an unverified recipient. Confirm the safety checklist and wait for the cool-down timer to unlock payment."))
                : !allChecked
                ? `Safety cool-down complete. Please confirm the remaining ${4 - checkedCount} checklist item(s) to unlock payment.`
                : `Checklist confirmed! Unlocking payment in ${secondsLeft}s...`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. PROCEED ACTION BUTTON */}
      {!isConfirming ? (
        <button
          onClick={() => setIsConfirming(true)}
          disabled={!isUnlocked}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display ${
            isUnlocked
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]'
              : 'bg-[#DDE7DF] text-[#5C6B63] cursor-not-allowed opacity-80'
          }`}
        >
          {isUnlocked ? (
            <>
              <span>{t.qrUnlockReadyButton || t.cautionProceedBtn || t.proceedToPay}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                {t.qrLockedButton || t.cautionLockedBtn} (
                {!allChecked ? `${checkedCount}/4 checks` : `${secondsLeft}s cool-down`}
                )
              </span>
            </>
          )}
        </button>
      ) : (
        <div role="alertdialog" aria-labelledby="caution-confirm-title" className="p-4 rounded-2xl bg-white border-2 border-amber-400 shadow-md space-y-3">
          <div>
            <div id="caution-confirm-title" className="font-bold text-sm text-[#0F1F17] font-display flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              {t.cautionConfirmTitle || "Are you sure?"}
            </div>
            <p className="text-xs text-[#5C6B63] mt-1 leading-relaxed">
              {t.cautionConfirmDesc || "This payee is not verified. UPI payments cannot be reversed once sent."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIsConfirming(false)}
              className="py-2.5 rounded-xl bg-[#EAF0EB] hover:bg-[#DDE7DF] border border-[#C5D3C7] text-[#0F1F17] font-bold text-xs transition font-display"
            >
              {t.cautionConfirmNo || "Cancel"}
            </button>
            <button
              onClick={onProceed}
              className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition font-display shadow"
            >
              {t.cautionConfirmYes || "Yes, Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultScreen({ result, onProceedToPay, onReset }) {
  const { t } = useLanguage();
  const auth = useAuth();
  const authFetch = auth?.authFetch || fetch;
  const [reportState, setReportState] = useState('idle'); // idle | reporting | reported | error

  const handleReportScam = async () => {
    if (!result?.checkId || reportState === 'reporting' || reportState === 'reported') return;
    setReportState('reporting');

    try {
      const res = await authFetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId: result.checkId,
          deviceId: getDeviceId()
        })
      });
      const data = await res.json();
      if (data.success) {
        setReportState('reported');
      } else {
        setReportState('error');
      }
    } catch {
      setReportState('error');
    }
  };

  if (!result) return null;

  const { score, verdict, reasons = [], vernacularExplanation, extractedUpi, latencyMs, engine } = result;
  const isScam = verdict === 'SCAM' || score >= 70;
  const isSafe = verdict === 'SAFE' && score < 30;
  const isCaution = !isScam && !isSafe;
  const isQr = Boolean(result.isQrScan || (result.qr && result.qr.upiId));

  const cleanReasons = dedupeReasons(reasons);

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="sage-card rounded-3xl p-4 sm:p-6 space-y-6">

        {/* 1. SCANNED QR PAYMENT DETAILS CARD (Shown when a QR was scanned) */}
        {isQr && result.qr && (
          <div className="p-4 rounded-2xl bg-white border border-[#D4E0D5] shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#E2EAE3] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#EAF0EB] text-[#0F1F17]">
                  <QrCode className="w-4 h-4 shrink-0" />
                </div>
                <span className="text-xs font-bold text-[#0F1F17] font-display">
                  {t.qrPayeeDetails || "Scanned QR Payment Details"}
                </span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isSafe
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : isScam
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {isSafe
                  ? (t.qrVerifiedBadge || "Verified Merchant")
                  : isScam
                  ? (t.qrMuleBadge || "Flagged Fraud / Mule")
                  : (t.qrUnverifiedBadge || "Unverified Individual VPA")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#5C6B63] block text-[11px] font-medium">{t.qrPayeeName || "Payee Name"}</span>
                <span className="font-bold text-[#0F1F17] text-sm font-display truncate block">
                  {result.qr.payeeName || '—'}
                </span>
              </div>
              <div>
                <span className="text-[#5C6B63] block text-[11px] font-medium">{t.qrUpiId || "UPI ID"}</span>
                <span className="font-mono font-semibold text-[#0F1F17] text-xs truncate block bg-[#F7FAF8] px-2 py-1 rounded border border-[#E2EAE3] mt-0.5">
                  {result.qr.upiId || extractedUpi || '—'}
                </span>
              </div>
              {result.qr.amount ? (
                <div>
                  <span className="text-[#5C6B63] block text-[11px] font-medium">{t.qrAmount || "Amount"}</span>
                  <span className="font-bold text-[#0F1F17] text-sm font-mono">
                    ₹{result.qr.amount}
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-[#5C6B63] block text-[11px] font-medium">{t.qrAmount || "Amount"}</span>
                  <span className="text-[#5C6B63] italic text-xs">
                    {t.qrAmountNotSet || "Enter in UPI app"}
                  </span>
                </div>
              )}
              {result.qr.note && (
                <div>
                  <span className="text-[#5C6B63] block text-[11px] font-medium">Note</span>
                  <span className="text-[#24352C] text-xs truncate block">
                    {result.qr.note}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. RISK GAUGE VISUAL CARD (Always at top, as designed) */}
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
            {isScam ? <ShieldAlert className="w-4 h-4 shrink-0" /> : isSafe ? <ShieldCheck className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{isScam ? t.scamSubtitle : isSafe ? t.safeSubtitle : t.cautionSubtitle}</span>
          </div>
          <p className="text-xs leading-relaxed mt-1 opacity-90">
            {vernacularExplanation}
          </p>
        </div>

        {/* 3. QR PAYMENT VERDICT SECTION (If this is a QR scan, show the dedicated decision gate) */}
        {isQr && (
          <div className="space-y-3 pt-1 border-t border-[#E2EAE3]">
            {isSafe && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 font-mono">
                      {t.qrPaymentVerdict || "CAN I GO FOR PAYMENT?"}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-emerald-950 mt-0.5">
                      {t.qrVerdictSafe || "SAFE TO PAY"}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-900/90 mt-1 leading-relaxed">
                      {t.qrVerdictSafeDesc || "Verified NPCI merchant counterparty. Safe to proceed with payment."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onProceedToPay(extractedUpi)}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display cursor-pointer"
                >
                  <span>{t.proceedToPay || "Proceed to Safe Pay"}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            )}

            {isScam && (
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800 font-mono">
                      {t.qrPaymentVerdict || "CAN I GO FOR PAYMENT?"}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold font-display text-rose-950 mt-0.5">
                      {t.qrVerdictBlocked || "DO NOT PAY — PAYMENT BLOCKED"}
                    </h3>
                    <p className="text-xs sm:text-sm text-rose-900/90 mt-1 leading-relaxed">
                      {t.qrVerdictBlockedDesc || "This QR pays an account flagged for financial fraud or mule activity. TrustLayer blocked outbound payment."}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-rose-100/90 border border-rose-300 rounded-xl text-center text-xs text-rose-900 font-bold flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4 shrink-0" />
                  <span>{t.paymentBlockedAlert || t.paymentBlocked}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="tel:1930"
                    className="py-3 px-3 rounded-xl bg-[#EAF0EB] hover:bg-[#DDE7DF] border border-[#C5D3C7] text-[#0F1F17] font-bold text-xs transition flex items-center justify-center gap-2 font-display text-center"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>{t.reportScam || "Call Cybercrime (1930)"}</span>
                  </a>
                  {reportState === 'reported' ? (
                    <div className="py-3 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 font-display text-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.reportSuccess || 'Reported. Thank you for protecting others.'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleReportScam}
                      disabled={reportState === 'reporting'}
                      className="py-3 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs transition flex items-center justify-center gap-2 font-display disabled:opacity-50 text-center cursor-pointer"
                    >
                      <Flag className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{reportState === 'reporting' ? (t.reporting || 'Reporting...') : (t.reportThisScam || 'Report this scam')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {isCaution && (
              <CautionGate
                key={result.checkId || result.receivedAt}
                result={result}
                onProceed={() => onProceedToPay(extractedUpi, { cautionAcknowledged: true })}
                isQr={true}
              />
            )}
          </div>
        )}

        {/* 4. EXPLAINABLE RISK SIGNALS (Deduplicated) */}
        {cleanReasons.length > 0 && (
          <div className="space-y-2 border-t border-[#E2EAE3] pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">
              {t.reasonsHeader || t.qrExplainableSignals || "Explainable Risk Signals"}
            </h4>
            <div className="space-y-1.5">
              {cleanReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] text-xs text-[#24352C] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span className="min-w-0">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. AI OPINIONS (Rules / Gemini / Grok) */}
        {Array.isArray(result.aiOpinions) && result.aiOpinions.length > 1 && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">
                {t.qrAiConsensus || t.aiCheckLabel}
              </h4>
              {result.agreement && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    result.agreement === 'agree'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : result.agreement === 'disagree'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-[#F7FAF8] border-[#D4E0D5] text-[#5C6B63]'
                  }`}
                >
                  {result.agreement === 'agree' ? t.aiAgree : result.agreement === 'disagree' ? t.aiDisagree : result.agreement === 'partial' ? t.aiPartial : t.aiSingle}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.aiOpinions.map((o) => (
                <span
                  key={o.provider}
                  title={o.model || undefined}
                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-xl border font-semibold ${
                    o.score >= 70
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : o.score >= 30
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {o.label}
                  <strong className="font-mono">{o.score}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 6. TELEMETRY INFO */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8E9C94] border-t border-[#E2EAE3] pt-3">
          <span>Engine: <strong className="text-[#5C6B63]">{engine || 'Dual-Engine Shield'}</strong></span>
          <span>Latency: <strong className="text-brand-600">{latencyMs || 18}ms</strong></span>
        </div>

        {/* 7. STANDARD MESSAGE ACTIONS (Shown only when NOT a QR scan, keeping original flow intact) */}
        {!isQr && (
          <div className="space-y-2 pt-2 border-t border-[#E2EAE3]">
            {isSafe && extractedUpi && (
              <button
                onClick={() => onProceedToPay(extractedUpi)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display cursor-pointer"
              >
                <span>{t.proceedToPay}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {isCaution && (
              <div className="space-y-3">
                <CautionGate
                  key={result.checkId || result.receivedAt}
                  result={result}
                  onProceed={() => onProceedToPay(extractedUpi, { cautionAcknowledged: true })}
                  isQr={false}
                />
                {reportState === 'reported' ? (
                  <div className="py-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 font-display text-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{t.reportSuccess || 'Reported. Thank you for protecting others.'}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleReportScam}
                    disabled={reportState === 'reporting'}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs transition flex items-center justify-center gap-2 font-display disabled:opacity-50 cursor-pointer"
                  >
                    <Flag className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{reportState === 'reporting' ? (t.reporting || 'Reporting...') : (t.reportThisScam || 'Report this scam')}</span>
                  </button>
                )}
              </div>
            )}

            {isScam && (
              <div className="space-y-2">
                <div className="p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-center text-xs text-rose-800 font-bold flex items-center justify-center gap-2">
                  <Ban className="w-4 h-4" />
                  <span>{t.paymentBlocked}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="tel:1930"
                    className="py-3 px-3 rounded-xl bg-[#EAF0EB] hover:bg-[#DDE7DF] border border-[#C5D3C7] text-[#0F1F17] font-bold text-xs transition flex items-center justify-center gap-2 font-display text-center"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>{t.reportScam}</span>
                  </a>
                  {reportState === 'reported' ? (
                    <div className="py-3 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 font-display text-center">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t.reportSuccess || 'Reported. Thank you for protecting others.'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleReportScam}
                      disabled={reportState === 'reporting'}
                      className="py-3 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs transition flex items-center justify-center gap-2 font-display disabled:opacity-50 text-center cursor-pointer"
                    >
                      <Flag className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{reportState === 'reporting' ? (t.reporting || 'Reporting...') : (t.reportThisScam || 'Report this scam')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. BACK BUTTON */}
        <button
          onClick={onReset}
          className="w-full py-2.5 rounded-xl text-[#5C6B63] hover:text-[#0F1F17] hover:bg-[#F7FAF8] border border-transparent hover:border-[#D4E0D5] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isQr ? (t.qrScanAnother || "Scan Another QR / Message") : t.backToCheck}</span>
        </button>

      </div>

    </div>
  );
}
