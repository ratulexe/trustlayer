import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, AlertTriangle, ExternalLink, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

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
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
          {t.payTitle}
        </h2>
        <p className="text-xs text-slate-500">
          {t.paySubtitle}
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-slate-200 shadow-card space-y-5">
        
        {/* Golden Rule Alert */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold font-display">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>{t.pinWarningTitle}</span>
          </div>
          <p className="leading-relaxed opacity-95">
            {t.pinWarningDesc}
          </p>
        </div>

        <form onSubmit={handleGeneratePay} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              {t.payeeLabel}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Payee Name
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {t.amountLabel}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Payment Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {!paymentResult ? (
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-float transition font-display flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying with TrustLayer...' : 'Generate Verified Payment Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 font-display flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified Pay Ready</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {paymentResult.paymentId}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 break-all bg-white p-2.5 rounded-lg border border-emerald-100">
                  {paymentResult.upiDeepLink}
                </div>
              </div>

              <a
                href={paymentResult.upiDeepLink}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 font-display text-center"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t.openUpiBtn}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </form>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Check</span>
          </button>
        )}

      </div>

    </div>
  );
}
