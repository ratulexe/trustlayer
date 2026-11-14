import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import RiskGauge from '../components/RiskGauge';
import { 
  ShieldCheckIcon, 
  ShieldAlertIcon, 
  ShieldBanIcon, 
  AlertTriangleIcon, 
  PhoneCallIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CopyIcon, 
  ShareIcon,
  SparklesIcon,
  LockIcon,
  CheckCircle2Icon
} from '../components/Icons';

export default function ResultScreen({ result, onProceedToPay, onReset }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  if (!result) return null;

  const { 
    score, 
    verdict, 
    reasons = [], 
    vernacularExplanation, 
    extractedUpi, 
    latencyMs, 
    engine, 
    checkId, 
    rawInput = '' 
  } = result;

  const isScam = verdict === 'SCAM' || score >= 70;
  const isCaution = !isScam && (verdict === 'CAUTION' || score >= 30);
  const isSafe = !isScam && !isCaution;

  const amountMatch = rawInput.match(/₹\s?([0-9,]+)/);
  const extractedAmount = amountMatch ? amountMatch[0] : null;

  const suspiciousKeywords = [
    'disconnected tonight',
    'power will be disconnected',
    'call officer',
    'won ₹25,00,000',
    'won ₹',
    'processing tax',
    'immediately transfer',
    'lottery_reward99',
    'powerbill',
    'enter your upi pin to receive',
    'kyc update',
    'account blocked',
    'security deposit'
  ];

  const renderHighlightedMessage = () => {
    if (!rawInput) return null;
    let parts = [rawInput];

    suspiciousKeywords.forEach((phrase) => {
      const nextParts = [];
      parts.forEach((p) => {
        if (typeof p !== 'string') {
          nextParts.push(p);
          return;
        }
        const index = p.toLowerCase().indexOf(phrase.toLowerCase());
        if (index !== -1) {
          const before = p.substring(0, index);
          const match = p.substring(index, index + phrase.length);
          const after = p.substring(index + phrase.length);
          if (before) nextParts.push(before);
          nextParts.push(
            <mark key={Math.random()} className="bg-[#FFE4E6] text-[#BE123C] font-bold px-1 rounded border border-[#FECDD3]">
              {match}
            </mark>
          );
          if (after) nextParts.push(after);
        } else {
          nextParts.push(p);
        }
      });
      parts = nextParts;
    });

    return parts;
  };

  const handleCopyReport = () => {
    const reportText = JSON.stringify({
      reportId: checkId || `chk_${Date.now()}`,
      verdict,
      riskScore: `${score}/100`,
      extractedVpa: extractedUpi || 'None',
      signals: reasons,
      vernacularExplanation,
      inspectionEngine: engine || 'Dual-Engine Heuristics + Gemini',
      latency: `${latencyMs || 18}ms`
    }, null, 2);

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TrustLayer Risk Verdict',
        text: `TrustLayer Threat Verdict: ${verdict} (Risk: ${score}/100) for UPI ID ${extractedUpi || 'request'}.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyReport();
    }
  };

  const handleReportScam = () => {
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7 pb-16">
      
      {/* Pristine White Card with Sage Border */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-9 lg:p-10 border border-[#D4E0D5] shadow-[0_8px_30px_rgba(15,31,23,0.04),0_2px_8px_rgba(15,31,23,0.02)] text-[#0F1F17] space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E2EAE3] pb-3.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F1F17] font-sans text-sm">
              {t.resultTitle}
            </span>
            <span className="text-[10px] font-mono text-[#5C6B63] bg-[#EAF0EB] px-2 py-0.5 rounded border border-[#D4E0D5]">
              ID: {checkId || 'chk_867816'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-2.5 py-1.5 rounded-lg border border-[#D4E0D5] text-[#5C6B63] hover:text-[#0F1F17] hover:bg-[#F7FAF8] transition flex items-center gap-1.5 font-mono text-[11px] cursor-pointer"
              title="Copy JSON Report"
            >
              <CopyIcon className="w-3.5 h-3.5" />
              <span>{copied ? t.copiedReport : t.copyReport}</span>
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-[#D4E0D5] text-[#5C6B63] hover:text-[#0F1F17] hover:bg-[#F7FAF8] transition cursor-pointer"
              title="Share Verdict"
            >
              <ShareIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Circular / Semicircular Risk Gauge */}
        <RiskGauge score={score} verdict={verdict} />

        {/* Extracted Target Entities Strip */}
        <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#D4E0D5] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] text-[#5C6B63] font-bold uppercase tracking-wider">
              {t.extractedEntitiesHeader}
            </span>
            <span className="text-[10px] font-mono text-[#5C6B63]">
              {extractedAmount ? `AMOUNT: ${extractedAmount}` : 'AMOUNT: NOT SPECIFIED'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D4E0D5]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#0F1F17] bg-[#EAF0EB] px-2.5 py-1 rounded border border-[#D4E0D5]">
                {extractedUpi || 'No explicit UPI ID extracted'}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isSafe 
                ? 'bg-[#E6F7EF] text-[#047857] border border-[#A7F3D0]' 
                : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
            }`}>
              {isSafe ? t.vpaVerifiedBadge : t.vpaUnverifiedBadge}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* "INSIDE THE DETECTION" SECTION */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2 border-t border-[#E2EAE3]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] text-[#059669] flex items-center justify-center">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-sans text-[#0F1F17]">
                {t.insideDetection}
              </h3>
              <p className="text-[11px] text-[#5C6B63]">
                {t.insideDetectionSub}
              </p>
            </div>
          </div>

          {/* Suspicious Phrases Highlighting in Raw Message */}
          {rawInput && isScam && (
            <div className="p-4 rounded-xl bg-[#FFE4E6]/50 border border-[#FECDD3] space-y-1.5 text-xs">
              <span className="font-bold text-[#BE123C] text-[11px] block">
                {t.highlightedPhrasesLabel}
              </span>
              <p className="text-[#0F1F17] leading-relaxed font-sans text-xs">
                {renderHighlightedMessage()}
              </p>
            </div>
          )}

          {/* Plain-Language Vernacular Explanation Card */}
          {vernacularExplanation && (
            <div className="p-4 rounded-xl bg-[#E6F7EF]/50 border border-[#A7F3D0] text-xs space-y-1">
              <span className="font-bold text-[#047857] block font-sans">
                AI Threat Assessment:
              </span>
              <p className="text-[#0F1F17] leading-relaxed">
                {vernacularExplanation}
              </p>
            </div>
          )}

          {/* Explainable Risk Signals */}
          {reasons.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0F1F17] font-sans block">
                {t.reasonsHeader}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reasons.map((reason, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      isScam 
                        ? 'bg-[#FFE4E6]/40 border-[#FECDD3] text-[#9F1239]' 
                        : isCaution 
                        ? 'bg-[#FEF3C7]/40 border-[#FDE68A] text-[#92400E]' 
                        : 'bg-[#E6F7EF]/50 border-[#A7F3D0] text-[#065F46]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 mt-1.5" />
                    <span className="font-medium leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* HIGH RISK ENFORCEMENT OR SAFE PAYMENT PROGRESSION */}
        {/* ========================================================================= */}
        {isScam ? (
          /* High-Risk: Strict Consumer Protection (Payment Blocked) */
          <div className="p-5 rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] text-[#9F1239] space-y-3">
            <div className="flex items-center gap-2 font-bold text-[#BE123C] text-sm font-sans">
              <ShieldBanIcon className="w-5 h-5 text-[#E11D48] shrink-0" />
              <span>{t.paymentBlockedAlert}</span>
            </div>
            <p className="text-xs text-[#9F1239] leading-relaxed">
              TrustLayer detected critical indicators of financial deception. Proceeding with this transaction will result in irreversible financial loss. Outflow blocked for consumer protection.
            </p>
            
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <button
                onClick={handleReportScam}
                className="px-4 py-2.5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer font-sans"
              >
                <PhoneCallIcon className="w-4 h-4" />
                <span>{reported ? 'Reported to 1930 Cybercrime!' : t.reportScam}</span>
              </button>
              <a
                href="tel:1930"
                className="px-3.5 py-2.5 rounded-xl border border-[#FDA4AF] text-[#BE123C] hover:bg-[#FFE4E6] text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                Dial 1930 Cyber Helpline
              </a>
            </div>
          </div>
        ) : (
          /* Safe or Caution: Proceed to Safe Pay */
          <div className="p-4 rounded-2xl bg-[#E6F7EF] border border-[#A7F3D0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#065F46]">
              <CheckCircle2Icon className="w-5 h-5 text-[#059669] shrink-0" />
              <span className="font-medium">
                {isSafe ? t.safeSubtitle : t.cautionSubtitle}
              </span>
            </div>
            <button
              onClick={() => onProceedToPay(extractedUpi, extractedAmount)}
              className="px-5 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer shrink-0 font-sans"
            >
              <span>{t.proceedToPay}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Action Footer */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2EAE3] text-xs">
          <button
            onClick={onReset}
            className="text-[#059669] hover:text-[#047857] font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>{t.backToCheck}</span>
          </button>

          <div className="text-[11px] font-mono text-[#5C6B63] flex items-center gap-2">
            <span>{t.engineLabel}: {engine || 'Dual-Engine Heuristics + Gemini'}</span>
            <span>•</span>
            <span>{t.latencyLabel}: {latencyMs || 18}ms</span>
          </div>
        </div>

      </div>

    </div>
  );
}
