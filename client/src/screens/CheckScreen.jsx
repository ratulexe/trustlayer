import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceId, fillTemplate } from '../utils/deviceId';
import QrScanner from '../components/QrScanner';
import { ScanLine, QrCode } from 'lucide-react';
import {
  ClipboardIcon,
  ShieldCheckIcon,
  ZapIcon,
  GiftIcon,
  CoffeeIcon,
  ArrowRightIcon,
  SparklesIcon,
  GlobeIcon,
  CpuIcon,
  LayersIcon,
  CheckCircle2Icon,
  LockIcon,
  ActivityIcon,
  CheckIcon
} from '../components/Icons';

// Demo QRs use exactly the same path as a real camera scan
const DEMO_QRS = [
  { id: 'shop', title: 'Local shop counter standee', sub: 'Physical QR at Ramu Tea Stall (₹45)', payload: 'upi://pay?pa=ramu.tea@upi&pn=Ramu%20Tea%20Stall&am=45.00&cu=INR&tn=Tea' },
  { id: 'flyer', title: 'WhatsApp flyer QR', sub: '"Scan to claim ₹25 lakh prize" (₹15,000 fee)', payload: 'upi://pay?pa=lottery_reward99@okhdfc&pn=PrizeFund&am=15000.00&cu=INR&tn=Tax' },
  { id: 'person', title: 'Personal QR sent on WhatsApp', sub: '"Pay ₹2,000 to release your parcel"', payload: 'upi://pay?pa=ravi.kumar@ybl&pn=Ravi%20Kumar&am=2000.00&cu=INR&tn=Parcel%20release' }
];

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

export default function CheckScreen({ onCheckComplete, prefilledText = '' }) {
  const { language, t } = useLanguage();
  const auth = useAuth();
  const authFetch = auth?.authFetch || fetch;
  const [inputText, setInputText] = useState(prefilledText);
  const [isLoading, setIsLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showDemoQrs, setShowDemoQrs] = useState(false);
  const textareaRef = useRef(null);
  const inspectorCardRef = useRef(null);

  useEffect(() => {
    if (prefilledText) {
      setTimeout(() => {
        inspectorCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [prefilledText]);

  // Input type auto-detection
  const detectPayloadType = (text) => {
    if (!text.trim()) return 'EMPTY';
    const lower = text.toLowerCase();
    if (lower.startsWith('upi://pay')) return 'UPI INTENT URI';
    if (/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(text.trim())) return 'UPI VPA';
    if (lower.includes('forwarded') || lower.includes('whatsapp') || text.includes('*') || text.includes('_')) return 'WHATSAPP FORWARD';
    return 'RAW SMS';
  };

  const payloadType = detectPayloadType(inputText);
  const isMonospacePayload = payloadType === 'UPI VPA' || payloadType === 'UPI INTENT URI';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(text);
          showToast('Pasted from clipboard');
        } else {
          showToast('Clipboard is empty');
        }
      } else {
        showToast('Clipboard access not supported in this browser');
      }
    } catch {
      showToast('Clipboard permission denied. Please paste manually (Ctrl+V).');
    }
  };

  const scrollToInspector = () => {
    inspectorCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    textareaRef.current?.focus();
  };

  // Normal scam check: rules + Gemini + Grok; saved to history/stats with a checkId.
  // Signed-in users are identified by token, others by an anonymous device ID.
  const runCheck = async (rawInput, minScore = 0) => {
    const res = await authFetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput, language, deviceId: getDeviceId(), minScore })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to analyze payload.');
    return data;
  };

  // Plays the redesign's 4-step scanning animation around any check
  const withScanAnimation = async (work) => {
    setIsLoading(true);
    setErrorMsg('');
    setExecutionStep(1);
    const timers = [
      setTimeout(() => setExecutionStep(2), 220),
      setTimeout(() => setExecutionStep(3), 440),
      setTimeout(() => setExecutionStep(4), 660)
    ];
    const started = Date.now();
    try {
      const result = await work();
      // Let the animation finish so the steps are readable
      await new Promise((r) => setTimeout(r, Math.max(0, 850 - (Date.now() - started))));
      onCheckComplete(result);
    } catch (err) {
      timers.forEach(clearTimeout);
      setErrorMsg(err?.message ? err.message : 'Could not reach TrustLayer API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    // A pasted UPI link is handled like a scanned QR
    if (/^upi:\/\/pay/i.test(inputText.trim())) {
      handleScanQr(inputText.trim());
      return;
    }
    withScanAnimation(() => runCheck(inputText));
  };

  // A scanned (or demo/pasted) QR: UPI QRs are parsed, risk-checked and checked like a
  // message; any other QR (e.g. a link) is checked as a message.
  const handleScanQr = (qrString) => {
    setShowScanner(false);
    setShowDemoQrs(false);
    withScanAnimation(async () => {
      if (!/^upi:\/\/pay/i.test(qrString)) {
        setInputText(qrString);
        const data = await runCheck(qrString);
        return { ...data, isQrScan: true, reasons: dedupeReasons([t.qrNotUpi, ...(data.reasons || [])]) };
      }

      const res = await fetch('/api/qr/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrString })
      });
      const parsedData = await res.json();
      if (!parsedData.success) throw new Error(t.qrInvalid);

      const { parsed, preflightRisk } = parsedData;
      const description = [
        `UPI QR payment to ${parsed.payeeName || 'payee'} (${parsed.upiId})`,
        parsed.amount ? `amount ₹${parsed.amount}` : '',
        parsed.note ? `note: ${parsed.note}` : ''
      ].filter(Boolean).join(', ');
      const check = await runCheck(description, preflightRisk.score);

      // Final risk = the stricter of the QR pre-flight and the full scam check
      const score = Math.max(check.score, preflightRisk.score);
      const verdict = score >= 70 ? 'SCAM' : score >= 30 ? 'CAUTION' : 'SAFE';
      const cooldownSeconds = verdict === 'CAUTION'
        ? (check.cooldownSeconds > 0 ? check.cooldownSeconds : (preflightRisk.cooldownSeconds || 20))
        : 0;

      const qrReason = preflightRisk.isMuleFlagged
        ? fillTemplate(t.qrReasonMule, { upi: parsed.upiId })
        : preflightRisk.isVerifiedMerchant
        ? fillTemplate(t.qrReasonVerified, { name: preflightRisk.merchantDetails?.name || parsed.payeeName, upi: parsed.upiId })
        : fillTemplate(t.qrReasonUnknown, { name: parsed.payeeName || '—', upi: parsed.upiId });

      const allReasons = dedupeReasons([qrReason, ...(check.reasons || []).filter((r) => r !== qrReason)]);

      return {
        ...check,
        score,
        verdict,
        cooldownSeconds,
        isQrScan: true,
        extractedUpi: parsed.upiId,
        reasons: allReasons,
        vernacularExplanation: verdict === check.verdict ? check.vernacularExplanation : verdict === 'CAUTION' ? t.qrUnknownExplain : check.vernacularExplanation,
        // Lets Safe Pay pre-fill exactly what the QR asked for
        qr: {
          upiId: parsed.upiId,
          payeeName: parsed.payeeName,
          amount: parsed.amount,
          note: parsed.note,
          isVerifiedMerchant: preflightRisk.isVerifiedMerchant,
          isMuleFlagged: preflightRisk.isMuleFlagged,
          merchantDetails: preflightRisk.merchantDetails
        }
      };
    });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const loadScenario = (id, text) => {
    setActiveScenarioId(id);
    setInputText(text);
    showToast('Loaded scenario payload');
    scrollToInspector();
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#0F1F17] text-white text-xs font-mono rounded-xl shadow-lg border border-[#059669]/30 flex items-center gap-2 animate-bounce-in transition-all"
        >
          <span className="w-2 h-2 rounded-full bg-[#A7F3D0] animate-pulse" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="space-y-2">
        <h1 className="font-serif-editorial text-3xl sm:text-5xl text-[#0F1F17]">{t.checkTitle}</h1>
        <p className="text-sm sm:text-base text-[#5C6B63] max-w-2xl">{t.checkSubtitle}</p>
      </div>

      {/* Real camera QR scan */}
      <button
        type="button"
        onClick={() => setShowScanner(true)}
        disabled={isLoading}
        className="w-full rounded-3xl p-5 sm:p-6 bg-[#059669] hover:bg-[#047857] disabled:opacity-60 text-white border border-[#047857] shadow-[0_4px_16px_rgba(5,150,105,0.25)] transition flex items-center gap-4 text-left"
      >
        <span className="w-12 h-12 shrink-0 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
          <ScanLine className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base sm:text-lg font-bold">{t.qrScanBtn}</span>
          <span className="block text-sm text-[#D1FAE5]">{t.qrScanSub}</span>
        </span>
        <ArrowRightIcon className="w-5 h-5 shrink-0" />
      </button>

      {showScanner && <QrScanner onResult={handleScanQr} onClose={() => setShowScanner(false)} />}

      {/* ========================================================================= */}
      {/* 2. PREMIUM SCAM CHECK INTERFACE: CRISP SAGE-BORDERED WHITE CARD */}
      {/* ========================================================================= */}
      <section ref={inspectorCardRef} className="relative scroll-mt-24">
        
        <div className="relative bg-white rounded-3xl p-6 sm:p-9 lg:p-10 border border-[#D4E0D5] shadow-[0_8px_30px_rgba(15,31,23,0.04),0_2px_8px_rgba(15,31,23,0.02)] space-y-6">
          
          {/* Card Top Bar: Auto-detection Pill + Clear + Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#E2EAE3] pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase border ${
                payloadType === 'EMPTY'
                  ? 'bg-[#EAF0EB] text-[#5C6B63] border-[#D4E0D5]'
                  : 'bg-[#E6F7EF] text-[#047857] border-[#A7F3D0]'
              }`}>
                {payloadType === 'EMPTY' ? 'WAITING FOR INPUT' : `DETECTED FORMAT: ${payloadType}`}
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#5C6B63]">
                Rules + Gemini + Grok
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {inputText && (
                <button
                  type="button"
                  onClick={() => { setInputText(''); setActiveScenarioId(null); }}
                  className="text-[#5C6B63] hover:text-[#0F1F17] transition font-medium cursor-pointer"
                >
                  {t.clearBtn}
                </button>
              )}
              <span className="font-mono text-[11px] text-[#5C6B63] tabular-nums">
                {inputText.length} / 1000
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={1000}
                placeholder={t.placeholder}
                className={`w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-2xl p-4 text-[#0F1F17] text-sm focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:border-[#059669] focus:bg-white transition-all resize-none placeholder:text-[#8E9C94] leading-relaxed ${
                  isMonospacePayload ? 'font-mono text-xs' : 'font-sans'
                }`}
                required
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={handlePaste}
                className="text-[#059669] hover:text-[#047857] font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <ClipboardIcon className="w-4 h-4" />
                <span>{t.pasteBtn}</span>
                <span className="hidden sm:inline text-[10px] font-mono text-[#5C6B63] bg-[#EAF0EB] px-1.5 py-0.5 rounded ml-1 border border-[#D4E0D5]">
                  ⌘+V
                </span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-[#5C6B63] font-mono">
                <CpuIcon className="w-3.5 h-3.5 text-[#059669]" />
                <span>Sub-Millisecond Threat Rail</span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#FFE4E6] border border-[#F43F5E]/30 text-[#F43F5E] text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F43F5E] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* 4-STAGE ANALYSIS PROGRESSION (CINEMATIC SCANNING BEAM) */}
            {/* ========================================================= */}
            {isLoading && (
              <div className="p-5 rounded-2xl bg-[#EAF0EB] border border-[#D4E0D5] space-y-3.5 font-mono text-xs shadow-inner">
                <div className="flex items-center justify-between border-b border-[#D4E0D5] pb-2 text-[11px] font-bold text-[#0F1F17]">
                  <span className="flex items-center gap-2 text-[#059669]">
                    <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
                    <span>{t.analyzing}</span>
                  </span>
                  <span className="text-[#5C6B63]">STAGE {executionStep} / 4</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    executionStep >= 1 ? 'bg-white border-[#059669] text-[#0F1F17] font-semibold shadow-xs' : 'bg-transparent border-[#D4E0D5] text-[#8E9C94]'
                  }`}>
                    <span className="w-4 h-4 rounded-full bg-[#E6F7EF] text-[#059669] flex items-center justify-center text-[10px] font-bold">01</span>
                    <span>{t.step1}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    executionStep >= 2 ? 'bg-white border-[#059669] text-[#0F1F17] font-semibold shadow-xs' : 'bg-transparent border-[#D4E0D5] text-[#8E9C94]'
                  }`}>
                    <span className="w-4 h-4 rounded-full bg-[#E6F7EF] text-[#059669] flex items-center justify-center text-[10px] font-bold">02</span>
                    <span>{t.step2}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    executionStep >= 3 ? 'bg-white border-[#059669] text-[#0F1F17] font-semibold shadow-xs' : 'bg-transparent border-[#D4E0D5] text-[#8E9C94]'
                  }`}>
                    <span className="w-4 h-4 rounded-full bg-[#E6F7EF] text-[#059669] flex items-center justify-center text-[10px] font-bold">03</span>
                    <span>{t.step3}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                    executionStep >= 4 ? 'bg-white border-[#059669] text-[#0F1F17] font-semibold shadow-xs' : 'bg-transparent border-[#D4E0D5] text-[#8E9C94]'
                  }`}>
                    <span className="w-4 h-4 rounded-full bg-[#E6F7EF] text-[#059669] flex items-center justify-center text-[10px] font-bold">04</span>
                    <span>{t.step4}</span>
                  </div>
                </div>

                {/* Progress Meter */}
                <div className="w-full bg-[#D4E0D5] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#059669] h-full transition-all duration-300"
                    style={{ width: `${(executionStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Analyze CTA Button (Solid Deep Emerald) */}
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-full py-4 rounded-xl bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] disabled:opacity-40 text-white font-bold text-sm shadow-[0_2px_12px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2.5 font-sans cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>{t.analyzing}</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>{t.checkBtn}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                  <span className="text-[10px] font-mono opacity-80 font-normal hidden sm:inline">
                    (⌘ + Enter)
                  </span>
                </span>
              )}
            </button>

          </form>

          {/* 3 Interactive Sample Scenarios */}
          <div className="pt-2 border-t border-[#E2EAE3] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wider font-bold text-[#5C6B63] font-sans flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5 text-[#059669]" />
                {t.presetLabel}
              </span>
              <span className="text-[11px] text-[#5C6B63] font-mono hidden sm:inline">
                Click scenario to load
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Scenario 1: Electricity Phishing (Amber) */}
              <button
                type="button"
                onClick={() => loadScenario('electricity', "Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office. Please immediately pay pending bill of ₹850 to powerbill@okaxis or call officer at 9876543210")}
                className={`p-4 text-left rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 group cursor-pointer ${
                  activeScenarioId === 'electricity' 
                    ? 'bg-[#FEF3C7]/40 border-[#F59E0B] ring-2 ring-[#F59E0B]/20 shadow-sm' 
                    : 'bg-[#F7FAF8] border-[#D4E0D5] hover:border-[#F59E0B] hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                    <ZapIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                    {t.presetElectricityTag}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#0F1F17] block group-hover:text-[#D97706] transition text-xs font-sans">
                    {t.presetElectricityTitle}
                  </span>
                  <p className="text-[11px] text-[#5C6B63] leading-relaxed mt-1">
                    {t.presetElectricityDesc}
                  </p>
                </div>
              </button>

              {/* Scenario 2: ₹25L Lottery Fraud (Coral Rose) */}
              <button
                type="button"
                onClick={() => loadScenario('lottery', "Congratulations! You won ₹25,00,000 in Special Scheme. To release your fund immediately transfer processing tax of ₹4,999 to lottery_reward99@okhdfc")}
                className={`p-4 text-left rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 group cursor-pointer ${
                  activeScenarioId === 'lottery' 
                    ? 'bg-[#FFE4E6]/40 border-[#F43F5E] ring-2 ring-[#F43F5E]/20 shadow-sm' 
                    : 'bg-[#F7FAF8] border-[#D4E0D5] hover:border-[#F43F5E] hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center shrink-0 border border-[#FECDD3]">
                    <GiftIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]">
                    {t.presetLotteryTag}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#0F1F17] block group-hover:text-[#E11D48] transition text-xs font-sans">
                    {t.presetLotteryTitle}
                  </span>
                  <p className="text-[11px] text-[#5C6B63] leading-relaxed mt-1">
                    {t.presetLotteryDesc}
                  </p>
                </div>
              </button>

              {/* Scenario 3: Safe Tea Vendor Payment (Deep Emerald) */}
              <button
                type="button"
                onClick={() => loadScenario('tea', "Payment for evening tea and snacks at Ramu Tea Stall. Pay ₹45 to chaispot@okicici")}
                className={`p-4 text-left rounded-2xl border transition-all text-xs flex flex-col justify-between gap-3 group cursor-pointer ${
                  activeScenarioId === 'tea' 
                    ? 'bg-[#E6F7EF] border-[#059669] ring-2 ring-[#A7F3D0] shadow-sm' 
                    : 'bg-[#F7FAF8] border-[#D4E0D5] hover:border-[#059669] hover:bg-white hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-[#E6F7EF] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                    <CoffeeIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E6F7EF] text-[#047857] border border-[#A7F3D0]">
                    {t.presetTeaTag}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-[#0F1F17] block group-hover:text-[#059669] transition text-xs font-sans">
                    {t.presetTeaTitle}
                  </span>
                  <p className="text-[11px] text-[#5C6B63] leading-relaxed mt-1">
                    {t.presetTeaDesc}
                  </p>
                </div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Demo QR codes: same path as a real camera scan */}
      <section className="sage-card rounded-3xl p-5 sm:p-6 space-y-4">
        <button
          type="button"
          onClick={() => setShowDemoQrs((v) => !v)}
          aria-expanded={showDemoQrs}
          className="w-full flex items-center justify-between gap-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-[#0F1F17]">
            <QrCode className="w-5 h-5 text-[#059669]" />
            {t.qrDemoBtn}
          </span>
          <ArrowRightIcon className={`w-4 h-4 text-[#5C6B63] transition ${showDemoQrs ? 'rotate-90' : ''}`} />
        </button>
        {showDemoQrs && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_QRS.map((q) => (
              <button
                key={q.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleScanQr(q.payload)}
                className="text-left p-4 rounded-2xl bg-[#F7FAF8] border border-[#D4E0D5] hover:border-[#059669] transition disabled:opacity-60"
              >
                <span className="block text-sm font-bold text-[#0F1F17]">{q.title}</span>
                <span className="block text-xs text-[#5C6B63] mt-0.5">{q.sub}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
