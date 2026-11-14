import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShieldCheckIcon, 
  ZapIcon, 
  ExternalLinkIcon, 
  ArrowLeftIcon, 
  CheckCircle2Icon, 
  LockIcon 
} from '../components/Icons';

export default function PayScreen({ prefilledVpa = '', onBack }) {
  const { t } = useLanguage();
  const [upiId, setUpiId] = useState(prefilledVpa || 'grocer@okaxis');
  const [payeeName, setPayeeName] = useState('Verified Merchant');
  const [amount, setAmount] = useState('350');
  const [note, setNote] = useState('TrustLayer Verified Pay');
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGeneratePay = async (e) => {
    e.preventDefault();
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
        setPaymentResult(data);
      } else {
        setErrorMsg(data.message || 'Payment initiation rejected.');
      }
    } catch (err) {
      setErrorMsg('Failed to connect to UPI rail: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-1.5 pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-display">
          {t.payTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          {t.paySubtitle}
        </p>
      </div>

      <div className="relative bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-[0_4px_24px_-4px_rgba(23,37,84,0.06)] space-y-5">
        
        {/* Golden Rule Alert Banner */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold font-display">
            <ShieldCheckIcon className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{t.pinWarningTitle}</span>
          </div>
          <p className="leading-relaxed opacity-90 pl-6">
            {t.pinWarningDesc}
          </p>
        </div>

        <form onSubmit={handleGeneratePay} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#111827] font-semibold mb-1.5">
              {t.payeeLabel}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
              className="w-full bg-[#FAFAF8] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-[#111827] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#111827] font-semibold mb-1.5">
                Payee Name
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                required
                className="w-full bg-[#FAFAF8] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-[#111827] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-[#111827] font-semibold mb-1.5">
                {t.amountLabel}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                className="w-full bg-[#FAFAF8] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-[#111827] font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#111827] font-semibold mb-1.5">
              Payment Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#FAFAF8] border border-slate-200/90 rounded-xl px-3.5 py-2.5 text-[#111827] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!paymentResult ? (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-[0_2px_10px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.35)] transition font-display cursor-pointer flex items-center justify-center gap-2"
            >
              <LockIcon className="w-4 h-4 text-white/90" />
              <span>{isLoading ? 'Verifying with TrustLayer...' : 'Generate Verified Payment Link →'}</span>
            </button>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="p-4 bg-[#F1F5F9]/80 border border-slate-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 font-display">
                    <CheckCircle2Icon className="w-4 h-4 text-emerald-600" />
                    <span>Verified Pay Ready</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {paymentResult.paymentId}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-700 break-all bg-white p-3 rounded-lg border border-slate-200/80">
                  {paymentResult.upiDeepLink}
                </div>
              </div>

              <a
                href={paymentResult.upiDeepLink}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-[0_2px_10px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition flex items-center justify-center gap-2 font-display text-center"
              >
                <ZapIcon className="w-4 h-4 text-white" />
                <span>{t.openUpiBtn}</span>
                <ExternalLinkIcon className="w-4 h-4 text-white" />
              </a>
            </div>
          )}
        </form>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full py-2 text-center text-xs text-[#64748B] hover:text-[#111827] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>Back to Check</span>
          </button>
        )}

      </div>

    </div>
  );
}
