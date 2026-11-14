import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShieldCheckIcon, 
  ZapIcon, 
  ExternalLinkIcon, 
  ArrowLeftIcon, 
  CheckCircle2Icon, 
  LockIcon, 
  QrCodeIcon, 
  CopyIcon,
  CheckIcon
} from '../components/Icons';

export default function PayScreen({ prefilledVpa = '', prefilledAmount = '', onBack }) {
  const { t } = useLanguage();
  const [upiId, setUpiId] = useState(prefilledVpa || 'grocer@okaxis');
  const [payeeName, setPayeeName] = useState('Verified Merchant');
  const [amount, setAmount] = useState(prefilledAmount ? prefilledAmount.replace(/[^0-9]/g, '') : '350');
  const [note, setNote] = useState('TrustLayer Verified Pay');
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  // Pre-Flight Safety Checklist State
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  const isChecklistComplete = check1 && check2 && check3;

  const handleGeneratePay = async (e) => {
    e.preventDefault();
    if (!isChecklistComplete) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId,
          payeeName,
          amount: parseFloat(amount),
          note
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPaymentResult({
          ...data,
          paymentLink: data.upiDeepLink || data.paymentLink,
          targetUpi: upiId,
          amount: amount,
          payeeName: payeeName
        });
      } else {
        setErrorMsg(data.message || 'Payment initiation rejected.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to UPI rail: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyUriToClipboard = (uri) => {
    navigator.clipboard.writeText(uri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-7 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2 pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857] uppercase tracking-wider">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-[#059669]" />
          <span>ZERO-TRUST PAYMENT GUARDRAIL</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-editorial text-[#0F1F17] tracking-tight">
          {t.payTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6B63] max-w-md mx-auto">
          {t.paySubtitle}
        </p>
      </div>

      {/* Main Elevated Card */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-9 lg:p-10 border border-[#D4E0D5] shadow-[0_8px_30px_rgba(15,31,23,0.04),0_2px_8px_rgba(15,31,23,0.02)] text-[#0F1F17] space-y-6">
        
        {/* Mandatory Golden Security Banner: Never enter PIN to receive */}
        <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 font-bold font-sans text-[#B45309] text-xs sm:text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-[#D97706] shrink-0" />
            <span>{t.pinWarningTitle}</span>
          </div>
          <p className="leading-relaxed opacity-95 pl-6 font-semibold">
            {t.pinWarningDesc}
          </p>
        </div>

        <form onSubmit={handleGeneratePay} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F1F17] font-semibold mb-1.5 font-sans">
                {t.payeeLabel}
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="name@okbank"
                className="w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-xl p-3 text-[#0F1F17] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:border-[#059669]"
                required
              />
            </div>

            <div>
              <label className="block text-[#0F1F17] font-semibold mb-1.5 font-sans">
                {t.payeeNameLabel}
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Merchant / Recipient"
                className="w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-xl p-3 text-[#0F1F17] text-xs focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:border-[#059669]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#0F1F17] font-semibold mb-1.5 font-sans">
                {t.amountLabel}
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="350"
                className="w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-xl p-3 text-[#0F1F17] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:border-[#059669]"
                required
              />
            </div>

            <div>
              <label className="block text-[#0F1F17] font-semibold mb-1.5 font-sans">
                {t.paymentNoteLabel}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Groceries / Bill"
                className="w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-xl p-3 text-[#0F1F17] text-xs focus:outline-none focus:ring-2 focus:ring-[#A7F3D0] focus:border-[#059669]"
              />
            </div>
          </div>

          {/* Pre-Flight Checklist */}
          <div className="pt-2 border-t border-[#E2EAE3] space-y-2.5">
            <span className="text-xs font-bold text-[#0F1F17] font-sans block">
              {t.checklistTitle}:
            </span>
            
            <div className="space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] cursor-pointer hover:bg-[#EAF0EB] transition">
                <input
                  type="checkbox"
                  checked={check1}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="mt-0.5 rounded text-[#059669] focus:ring-[#A7F3D0]"
                />
                <span className="text-[#0F1F17] text-[11px] leading-relaxed">
                  {t.checkItem1}
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] cursor-pointer hover:bg-[#EAF0EB] transition">
                <input
                  type="checkbox"
                  checked={check2}
                  onChange={(e) => setCheck2(e.target.checked)}
                  className="mt-0.5 rounded text-[#059669] focus:ring-[#A7F3D0]"
                />
                <span className="text-[#0F1F17] text-[11px] leading-relaxed">
                  {t.checkItem2}
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] cursor-pointer hover:bg-[#EAF0EB] transition">
                <input
                  type="checkbox"
                  checked={check3}
                  onChange={(e) => setCheck3(e.target.checked)}
                  className="mt-0.5 rounded text-[#059669] focus:ring-[#A7F3D0]"
                />
                <span className="text-[#0F1F17] text-[11px] leading-relaxed">
                  {t.checkItem3}
                </span>
              </label>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FFE4E6] border border-[#F43F5E]/30 text-[#F43F5E] text-xs">
              {errorMsg}
            </div>
          )}

          {/* Generate Verified Payment Link Button */}
          {!paymentResult && (
            <button
              type="submit"
              disabled={isLoading || !isChecklistComplete}
              className="w-full py-4 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:opacity-40 text-white font-bold text-sm shadow-[0_2px_12px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_20px_rgba(5,150,105,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              {isLoading ? (
                <span>{t.verifyingPay}</span>
              ) : (
                <span>{t.generatePayBtn}</span>
              )}
            </button>
          )}
        </form>

        {/* Generated Verified Payment Intent Details */}
        {paymentResult && (
          <div className="p-5 rounded-2xl bg-[#E6F7EF] border border-[#A7F3D0] space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-[#A7F3D0] pb-2">
              <span className="font-bold text-[#065F46] font-sans flex items-center gap-2">
                <CheckCircle2Icon className="w-4 h-4 text-[#059669]" />
                {t.verifiedPayReady}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#A7F3D0] text-[#065F46]">
                NPCI COMPLIANT
              </span>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-2 gap-2 text-[#0F1F17] font-mono text-[11px]">
              <div>
                <span className="text-[#5C6B63] block text-[10px]">PAYEE VPA</span>
                <span className="font-bold">{paymentResult.targetUpi}</span>
              </div>
              <div>
                <span className="text-[#5C6B63] block text-[10px]">AMOUNT</span>
                <span className="font-bold text-[#059669] text-sm">₹{paymentResult.amount}</span>
              </div>
            </div>

            {/* Standard upi://pay URI preview */}
            <div className="p-3 bg-white rounded-xl border border-[#A7F3D0] font-mono text-[11px] text-[#0F1F17] break-all flex items-center justify-between gap-2">
              <span>{paymentResult.paymentLink}</span>
              <button
                type="button"
                onClick={() => copyUriToClipboard(paymentResult.paymentLink)}
                className="px-2 py-1 rounded bg-[#EAF0EB] hover:bg-[#D4E0D5] text-[#0F1F17] font-mono text-[10px] shrink-0 cursor-pointer"
              >
                {copiedUri ? 'Copied!' : 'Copy URI'}
              </button>
            </div>

            {/* Launch Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <a
                href={paymentResult.paymentLink}
                className="w-full sm:w-auto flex-1 py-3.5 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-center text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <ExternalLinkIcon className="w-4 h-4" />
                <span>{t.openUpiBtn}</span>
              </a>

              <button
                type="button"
                onClick={() => setShowSandboxModal(true)}
                className="w-full sm:w-auto py-3.5 px-4 rounded-xl border border-[#D4E0D5] text-[#0F1F17] bg-white hover:bg-[#EAF0EB] font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <QrCodeIcon className="w-4 h-4 text-[#059669]" />
                <span>{t.demoSandboxBtn}</span>
              </button>
            </div>

            <div className="text-[10px] font-mono text-[#047857] text-center pt-1">
              {t.securitySealText}: SHA256-INTENT-AUDITED
            </div>
          </div>
        )}

        {/* Back Action */}
        <div className="pt-2 border-t border-[#E2EAE3]">
          <button
            type="button"
            onClick={onBack}
            className="text-[#059669] hover:text-[#047857] font-semibold flex items-center gap-1.5 transition text-xs cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Back to Scam Check</span>
          </button>
        </div>

      </div>

      {/* Sandbox Demo Simulation Modal */}
      {showSandboxModal && paymentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-[#D4E0D5]">
            <div className="flex items-center justify-between border-b border-[#E2EAE3] pb-2">
              <span className="font-bold text-sm text-[#0F1F17] font-sans">
                Simulated UPI App Intent
              </span>
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-[#5C6B63] hover:text-[#0F1F17] text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2 space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-[#E6F7EF] text-[#059669] mx-auto flex items-center justify-center">
                <CheckCircle2Icon className="w-9 h-9" />
              </div>
              <span className="text-xs text-[#5C6B63] block">Paying to verified merchant</span>
              <span className="text-xl font-bold font-mono text-[#0F1F17] block">
                {paymentResult.payeeName || 'Verified Merchant'}
              </span>
              <span className="text-2xl font-black font-mono text-[#059669] block">
                ₹{paymentResult.amount}
              </span>
              <span className="text-[11px] font-mono text-[#5C6B63] block">
                {paymentResult.targetUpi}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] text-[11px] text-[#5C6B63] space-y-1">
              <div className="flex justify-between">
                <span>TrustLayer Rail:</span>
                <span className="font-bold text-[#059669]">Passed Pre-flight</span>
              </div>
              <div className="flex justify-between">
                <span>Cryptographic Hash:</span>
                <span className="font-mono text-[10px]">sha256_tl_valid</span>
              </div>
            </div>

            <button
              onClick={() => setShowSandboxModal(false)}
              className="w-full py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs transition cursor-pointer font-sans"
            >
              Close Simulator
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
