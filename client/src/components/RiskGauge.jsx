import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheckIcon, ShieldAlertIcon, AlertTriangleIcon } from './Icons';

export default function RiskGauge({ score = 0, verdict = 'SAFE' }) {
  const { t } = useLanguage();

  const isScam = verdict === 'SCAM' || score >= 70;
  const isCaution = !isScam && (verdict === 'CAUTION' || score >= 30);

  const theme = isScam
    ? {
        stroke: '#F43F5E',
        text: 'text-[#F43F5E]',
        pillBg: 'bg-[#FFE4E6]',
        pillBorder: 'border-[#FECDD3]',
        pillText: 'text-[#BE123C]'
      }
    : isCaution
    ? {
        stroke: '#F59E0B',
        text: 'text-[#D97706]',
        pillBg: 'bg-[#FEF3C7]',
        pillBorder: 'border-[#FDE68A]',
        pillText: 'text-[#B45309]'
      }
    : {
        stroke: '#059669',
        text: 'text-[#059669]',
        pillBg: 'bg-[#E6F7EF]',
        pillBorder: 'border-[#A7F3D0]',
        pillText: 'text-[#047857]'
      };

  const verdictLabel = isScam ? t.scamVerdict : isCaution ? t.cautionVerdict : t.safeVerdict;

  // SVG Circular Gauge calculations
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#F7FAF8] border border-[#D4E0D5] rounded-3xl w-full relative overflow-hidden">
      
      {/* Circular SVG Gauge */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E2EAE3"
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5C6B63]">
            {t.riskScore}
          </span>
          <div className="flex items-baseline justify-center">
            <span className={`text-5xl font-black font-mono tracking-tight tabular-nums ${theme.text}`}>
              {score}
            </span>
            <span className="text-xs font-mono text-[#5C6B63] font-medium">/100</span>
          </div>
        </div>
      </div>

      {/* Verdict Pill Badge with Status Icon */}
      <div className={`mt-5 px-4 py-2 rounded-full text-xs font-extrabold font-sans border flex items-center gap-2 shadow-xs ${theme.pillBg} ${theme.pillBorder} ${theme.pillText}`}>
        {isScam ? (
          <ShieldAlertIcon className="w-4 h-4 shrink-0 text-[#F43F5E]" />
        ) : isCaution ? (
          <AlertTriangleIcon className="w-4 h-4 shrink-0 text-[#F59E0B]" />
        ) : (
          <ShieldCheckIcon className="w-4 h-4 shrink-0 text-[#059669]" />
        )}
        <span>{verdictLabel}</span>
      </div>

    </div>
  );
}
