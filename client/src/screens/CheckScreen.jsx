import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
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

export default function CheckScreen({ onCheckComplete, prefilledText = '', onExploreProtection }) {
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState(prefilledText);
  const [isLoading, setIsLoading] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [activeScenarioId, setActiveScenarioId] = useState(null);
  const textareaRef = useRef(null);
  const inspectorCardRef = useRef(null);

  useEffect(() => {
    if (prefilledText) {
      setInputText(prefilledText);
      setTimeout(() => {
        inspectorCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [prefilledText]);

  // Input Type Auto-detection
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');
    setExecutionStep(1);

    const timer1 = setTimeout(() => setExecutionStep(2), 220);
    const timer2 = setTimeout(() => setExecutionStep(3), 440);
    const timer3 = setTimeout(() => setExecutionStep(4), 660);

    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawInput: inputText,
          language,
          deviceId: 'trustlayer_pwa_web'
        })
      });

      const data = await res.json();
      
      setTimeout(() => {
        setIsLoading(false);
        if (data.success) {
          onCheckComplete(data);
        } else {
          setErrorMsg(data.error || 'Failed to analyze payload.');
        }
      }, 850);

    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setIsLoading(false);
      setErrorMsg('Could not reach TrustLayer API: ' + err.message);
    }
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
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#0F1F17] text-white text-xs font-mono rounded-xl shadow-lg border border-[#059669]/30 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#A7F3D0] animate-pulse" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: EDITORIAL TYPOGRAPHY & ORGANIC DATA-STREAM VECTOR LINES */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#D4E0D5] shadow-[0_4px_24px_rgba(15,31,23,0.03),0_20px_50px_rgba(15,31,23,0.02)] p-7 sm:p-12 lg:p-16">
        
        {/* Subtle Ambient Radial Mint & Sage Background Accents */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] rounded-full bg-[#E6F7EF]/60 blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full bg-[#EAF0EB]/80 blur-[80px] pointer-events-none" />

        {/* ORGANIC WAVE / DATA-STREAM VECTOR LINES (Pareto Style) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-70">
          <svg className="w-full h-full" viewBox="0 0 1200 650" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            {/* Stream 1: Top Left to Center */}
            <path 
              d="M-50,120 C250,90 350,280 620,290 C850,300 950,220 1250,260" 
              stroke="#D4E0D5" 
              strokeWidth="1.5" 
            />
            <path 
              d="M-50,120 C250,90 350,280 620,290 C850,300 950,220 1250,260" 
              stroke="#059669" 
              strokeWidth="1.5" 
              className="animate-stream-flow"
              opacity="0.45"
            />

            {/* Stream 2: Mid-Left curving upward */}
            <path 
              d="M-40,240 C200,220 400,160 620,270 C840,380 1020,310 1260,340" 
              stroke="#E2EAE3" 
              strokeWidth="1.2" 
            />
            <path 
              d="M-40,240 C200,220 400,160 620,270 C840,380 1020,310 1260,340" 
              stroke="#34D399" 
              strokeWidth="1.2" 
              className="animate-stream-flow-fast"
              opacity="0.4"
            />

            {/* Stream 3: Bottom Left to Center Right */}
            <path 
              d="M-60,420 C180,440 380,330 650,320 C900,310 1040,460 1280,420" 
              stroke="#D4E0D5" 
              strokeWidth="1.5" 
            />
            <path 
              d="M-60,420 C180,440 380,330 650,320 C900,310 1040,460 1280,420" 
              stroke="#059669" 
              strokeWidth="1.5" 
              className="animate-stream-flow"
              opacity="0.35"
            />

            {/* Stream 4: Gentle lower wave */}
            <path 
              d="M-30,520 C220,500 450,470 700,430 C950,390 1100,490 1250,510" 
              stroke="#E2EAE3" 
              strokeWidth="1" 
            />
          </svg>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Eyebrow Pill (Mint Badge) */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]"></span>
              </span>
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#047857] uppercase">
                {t.heroEyebrow}
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-serif-editorial text-[#0F1F17] tracking-tight leading-[1.12]">
              {t.heroHeadline}
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base text-[#5C6B63] max-w-xl leading-relaxed font-sans font-normal">
              {t.heroSubtext}
            </p>

            {/* Two CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToInspector}
                className="px-6 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-[0_4px_16px_rgba(5,150,105,0.25)] hover:shadow-[0_6px_22px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <span>{t.ctaAnalyze}</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (onExploreProtection) {
                    onExploreProtection();
                  } else {
                    document.getElementById('architecture-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-5 py-3.5 rounded-xl bg-white hover:bg-[#EAF0EB] text-[#0F1F17] font-semibold text-sm border border-[#D4E0D5] hover:border-[#5C6B63] transition-all flex items-center gap-2 cursor-pointer font-sans"
              >
                <LayersIcon className="w-4 h-4 text-[#059669]" />
                <span>{t.ctaExplore}</span>
              </button>
            </div>

            {/* Three Feature Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 border-t border-[#D4E0D5] text-xs text-[#0F1F17]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-[#047857]">
                  <SparklesIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] sm:text-xs text-[#0F1F17]">{t.trustAi}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-[#047857]">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] sm:text-xs text-[#0F1F17]">{t.trustExplain}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center shrink-0 text-[#047857]">
                  <GlobeIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-[11px] sm:text-xs text-[#0F1F17]">{t.trustMulti}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Interactive Security Preview Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[350px] sm:min-h-[420px]">
            
            {/* Center Glowing Focal Ambient Circle */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-[#A7F3D0]/40 to-[#E6F7EF] blur-2xl pointer-events-none" />

            {/* Central Elevated Shield Preview Card */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 border border-[#D4E0D5] shadow-[0_12px_36px_rgba(15,31,23,0.06),0_2px_8px_rgba(15,31,23,0.03)] space-y-4"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#E2EAE3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#059669] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    TL
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#0F1F17] block font-sans">
                      Threat Shield Preview
                    </span>
                    <span className="text-[10px] font-mono text-[#059669] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                      LIVE ACTIVE GUARD
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-[#5C6B63] bg-[#EAF0EB] px-2 py-0.5 rounded-md border border-[#D4E0D5]">
                  &lt;14ms
                </span>
              </div>

              {/* Simulated Scan Wave Visualization */}
              <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2EAE3] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#5C6B63]">
                  <span>SIMULATED VPA</span>
                  <span className="text-[#059669] font-bold">VERIFIED</span>
                </div>
                <div className="font-mono text-xs font-bold text-[#0F1F17]">
                  chaispot@okicici
                </div>
                <div className="h-1.5 w-full bg-[#E2EAE3] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#059669] to-[#34D399] w-full rounded-full" />
                </div>
              </div>

              {/* Intercepted Phishing Tag */}
              <div className="p-3 rounded-2xl bg-[#FFE4E6]/60 border border-[#F43F5E]/30 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#F43F5E]">
                  <span className="flex items-center gap-1">
                    <ZapIcon className="w-3 h-3" />
                    POWER BILL TRAP
                  </span>
                  <span>92/100 RISK</span>
                </div>
                <p className="text-[11px] text-[#0F1F17] line-clamp-1">
                  "Electricity will be disconnected at 9.30 PM..."
                </p>
                <div className="text-[10px] text-[#F43F5E] font-semibold">
                  Blocked before debit
                </div>
              </div>

              {/* Telemetry Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-[#5C6B63] pt-1 border-t border-[#E2EAE3]">
                <span>DUAL ENGINE: HEURISTICS + GEMINI</span>
                <span className="text-[#059669] font-bold">99.8% ACCURACY</span>
              </div>
            </motion.div>

            {/* Small Floating Micro-Card (Top Right) */}
            <div className="absolute -top-3 right-0 sm:-right-2 z-20 animate-float-gentle hidden sm:block">
              <div className="bg-white p-3 rounded-2xl border border-[#D4E0D5] shadow-md text-xs flex items-center gap-2">
                <CheckCircle2Icon className="w-4 h-4 text-[#059669]" />
                <span className="font-mono text-[11px] text-[#0F1F17] font-semibold">
                  NPCI URI Compliant
                </span>
              </div>
            </div>

            {/* Small Floating Micro-Card (Bottom Left) */}
            <div className="absolute -bottom-3 left-0 sm:-left-2 z-20 hidden sm:block">
              <div className="bg-white p-2.5 rounded-2xl border border-[#D4E0D5] shadow-md text-xs flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-[#059669]" />
                <span className="font-mono text-[11px] text-[#5C6B63]">
                  15,310 Signatures
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

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
                Dual-Engine (Heuristics + Gemini 2.5)
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

      {/* ========================================================================= */}
      {/* 3. ARCHITECTURE: "CALM INTELLIGENCE. UNCOMPROMISING SECURITY." */}
      {/* ========================================================================= */}
      <section id="architecture-section" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857] uppercase tracking-wider">
            <CpuIcon className="w-3.5 h-3.5" />
            <span>FINTECH CYBERSECURITY ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif-editorial text-[#0F1F17] tracking-tight">
            {t.futureOfTrust}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6B63] leading-relaxed">
            {t.futureOfTrustSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] space-y-3.5 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <ZapIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F1F17] font-sans">
              {t.heuristicsEngineTitle}
            </h3>
            <p className="text-xs text-[#5C6B63] leading-relaxed">
              {t.heuristicsEngineDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#059669] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>&lt;1ms DETERMINISTIC ENGINE</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] space-y-3.5 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F1F17] font-sans">
              {t.geminiEngineTitle}
            </h3>
            <p className="text-xs text-[#5C6B63] leading-relaxed">
              {t.geminiEngineDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#059669] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>MULTILINGUAL CONTEXTUAL AI</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] space-y-3.5 hover:border-[#059669] transition shadow-[0_4px_16px_rgba(15,31,23,0.02)]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7EF] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <LockIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0F1F17] font-sans">
              {t.npciRailTitle}
            </h3>
            <p className="text-xs text-[#5C6B63] leading-relaxed">
              {t.npciRailDesc}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#059669] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
              <span>ZERO-TRUST PAYMENT INTENT</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CLOSING CTA: CALM SAGE EDITORIAL BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-[#EAF0EB] p-8 sm:p-12 border border-[#D4E0D5] text-center space-y-4 shadow-sm">
        <h3 className="text-2xl sm:text-3xl font-serif-editorial text-[#0F1F17] tracking-tight max-w-xl mx-auto">
          {t.closingCtaTitle}
        </h3>
        <p className="text-xs sm:text-sm text-[#5C6B63] max-w-lg mx-auto leading-relaxed">
          {t.closingCtaDesc}
        </p>

        <div className="pt-2">
          <button
            onClick={scrollToInspector}
            className="px-6 py-3.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm shadow-[0_4px_16px_rgba(5,150,105,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer font-sans"
          >
            <span>{t.closingCtaBtn}</span>
            <ArrowRightIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

    </div>
  );
}
