import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceId, fillTemplate } from '../utils/deviceId';
import ScamChip from '../components/ScamChip';
import QrScanner from '../components/QrScanner';
import { Clipboard, ArrowRight, Loader2, Zap, Gift, Store, X, QrCode, ScanLine } from 'lucide-react';

export default function CheckScreen({ onCheckComplete }) {
  const { language, t } = useLanguage();
  const auth = useAuth();
  const authFetch = auth?.authFetch || fetch;
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showQrSim, setShowQrSim] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        setInputText(text);
      }
    } catch {
      // ignore clipboard permission error
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await authFetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: inputText,
          language,
          deviceId: getDeviceId()
        })
      });

      const data = await res.json();
      if (data.success) {
        onCheckComplete(data);
      } else {
        setErrorMsg(data.error || 'Failed to analyze text.');
      }
    } catch (err) {
      setErrorMsg('Could not reach TrustLayer API: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Runs the normal scam check (rule engine + Gemini, saved to history/stats, gets a checkId)
  const runCheck = async (rawInput) => {
    const res = await authFetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput, language, deviceId: getDeviceId() })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to analyze text.');
    return data;
  };

  // A scanned (or demo) QR: UPI QRs are parsed, risk-checked and checked like a message;
  // any other QR (e.g. a link) is checked as a message.
  const handleScanQr = async (qrString) => {
    setIsLoading(true);
    setErrorMsg('');
    setShowQrSim(false);
    setShowScanner(false);

    try {
      if (!/^upi:\/\/pay/i.test(qrString)) {
        setInputText(qrString);
        const data = await runCheck(qrString);
        onCheckComplete({ ...data, reasons: [t.qrNotUpi, ...(data.reasons || [])] });
        return;
      }

      const res = await fetch('/api/qr/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrString })
      });
      const parsedData = await res.json();
      if (!parsedData.success) {
        setErrorMsg(t.qrInvalid);
        return;
      }

      const { parsed, preflightRisk } = parsedData;
      // Describe the QR as a message so the scam engines also read the payee name and note
      const description = [
        `UPI QR payment to ${parsed.payeeName || 'payee'} (${parsed.upiId})`,
        parsed.amount ? `amount ₹${parsed.amount}` : '',
        parsed.note ? `note: ${parsed.note}` : ''
      ].filter(Boolean).join(', ');
      const check = await runCheck(description);

      // Final risk = the stricter of the QR pre-flight and the full scam check
      const score = Math.max(check.score, preflightRisk.score);
      const verdict = score >= 70 ? 'SCAM' : score >= 30 ? 'CAUTION' : 'SAFE';
      const qrReason = preflightRisk.isMuleFlagged
        ? fillTemplate(t.qrReasonMule, { upi: parsed.upiId })
        : preflightRisk.isVerifiedMerchant
        ? fillTemplate(t.qrReasonVerified, { name: preflightRisk.merchantDetails?.name || parsed.payeeName, upi: parsed.upiId })
        : fillTemplate(t.qrReasonUnknown, { name: parsed.payeeName || '—', upi: parsed.upiId });

      onCheckComplete({
        ...check,
        score,
        verdict,
        extractedUpi: parsed.upiId,
        reasons: [qrReason, ...(check.reasons || []).filter((r) => r !== qrReason)],
        vernacularExplanation:
          verdict === check.verdict
            ? check.vernacularExplanation
            : verdict === 'CAUTION'
            ? t.qrUnknownExplain
            : check.vernacularExplanation,
        // Lets Safe Pay pre-fill exactly what the QR asked for
        qr: { upiId: parsed.upiId, payeeName: parsed.payeeName, amount: parsed.amount, note: parsed.note }
      });
    } catch (err) {
      setErrorMsg(t.qrFailed + (err?.message ? ` (${err.message})` : ''));
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetText) => {
    setInputText(presetText);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
          {t.checkTitle}
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {t.checkSubtitle}
        </p>
      </div>

      {/* Real camera QR scan */}
      <button
        type="button"
        onClick={() => setShowScanner(true)}
        disabled={isLoading}
        className="w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-float hover:brightness-105 disabled:opacity-60 transition flex items-center gap-4 text-left"
      >
        <span className="w-12 h-12 shrink-0 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
          <ScanLine className="w-6 h-6" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base font-bold font-display">{t.qrScanBtn}</span>
          <span className="block text-sm text-indigo-50/95">{t.qrScanSub}</span>
        </span>
        <ArrowRight className="w-5 h-5 shrink-0" />
      </button>

      {showScanner && <QrScanner onResult={handleScanQr} onClose={() => setShowScanner(false)} />}

      {/* Main Check Card */}
      <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="relative">
            <textarea
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition resize-none font-sans"
              required
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg text-xs bg-slate-200 text-slate-600 hover:bg-slate-300 transition flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePaste}
                className="h-10 px-3.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 hover:bg-brand-100 font-semibold flex items-center gap-1.5 transition"
              >
                <Clipboard className="w-4 h-4" />
                <span>{t.pasteBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrSim(!showQrSim)}
                aria-expanded={showQrSim}
                className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-brand-200 font-semibold flex items-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4 text-brand-600" />
                <span>{t.qrDemoBtn}</span>
              </button>
            </div>

            <span className="hidden sm:inline text-xs text-slate-400 font-mono">
              Dual-Engine: Heuristics + Gemini
            </span>
          </div>

          {/* QR Simulation Dropdown Panel */}
          {showQrSim && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block font-display">
                  Simulate Camera QR Scan (Point phone at real-world QR):
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  The user never knows in advance if a QR is genuine. TrustLayer inspects the raw payload before payment:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleScanQr('upi://pay?pa=ramu.tea@upi&pn=Ramu%20Tea%20Stall&am=45.00&cu=INR&tn=Tea')}
                  className="p-3 rounded-xl bg-surface border border-slate-200 hover:border-brand-300 text-left transition shadow-xs group"
                >
                  <span className="font-bold text-slate-800 group-hover:text-brand-600 block font-display">
                    Local Shop Counter Standee
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    Physical QR displayed at Tea Stall (₹45)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    Payload: ramu.tea@upi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScanQr('upi://pay?pa=lottery_reward99@okhdfc&pn=PrizeFund&am=15000.00&cu=INR&tn=Tax')}
                  className="p-3 rounded-xl bg-surface border border-slate-200 hover:border-brand-300 text-left transition shadow-xs group"
                >
                  <span className="font-bold text-slate-800 group-hover:text-brand-600 block font-display">
                    WhatsApp Flyer QR Code
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    "Scan to Claim ₹25 Lakh Prize" (₹15,000 fee)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    Payload: lottery_reward99@okhdfc
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleScanQr('upi://pay?pa=ravi.kumar@ybl&pn=Ravi%20Kumar&am=2000.00&cu=INR&tn=Parcel%20release')}
                  className="sm:col-span-2 p-3 rounded-xl bg-surface border border-slate-200 hover:border-brand-300 text-left transition shadow-xs group"
                >
                  <span className="font-bold text-slate-800 group-hover:text-brand-600 block font-display">
                    Personal QR sent on WhatsApp
                  </span>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    "Pay ₹2,000 to release your parcel" from an unknown person
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 mt-1 block">
                    Payload: ravi.kumar@ybl
                  </span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-float hover:shadow-lg transition flex items-center justify-center gap-2 font-display"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.checking}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>{t.checkBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>
      </div>

      {/* 10:30 AM Evaluation Preset Scenarios */}
      <div className="bg-surface rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-subtle space-y-3">
        <span className="text-xs uppercase tracking-wider font-bold text-slate-500 font-display block">
          {t.presetLabel}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <ScamChip
            icon={Zap}
            label="Electricity Phishing"
            subtext="Threatens power cut at 9:30 PM"
            onClick={() => loadPreset("Dear customer, your electricity power will be disconnected tonight at 9.30 PM from electricity office. Please immediately pay pending bill of ₹850 to powerbill@okaxis")}
          />
          <ScamChip
            icon={Gift}
            label="₹25L Lottery Scam"
            subtext="Demands processing fee for prize"
            onClick={() => loadPreset("Congratulations! You won ₹25,00,000 in Special Lottery. To release your fund immediately transfer processing tax of ₹12,500 to lottery_reward99@okhdfc")}
          />
          <ScamChip
            icon={Store}
            label="Safe Tea Vendor"
            subtext="Verified street food merchant"
            onClick={() => loadPreset("Payment for evening tea and snacks at Ramu Tea Stall. Pay ₹45 to ramu.tea@upi")}
          />
        </div>
      </div>

    </div>
  );
}
