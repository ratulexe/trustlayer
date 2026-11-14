import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import CheckScreen from './screens/CheckScreen';
import ResultScreen from './screens/ResultScreen';
import PayScreen from './screens/PayScreen';
import DashboardScreen from './screens/DashboardScreen';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('check');
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const [targetVpa, setTargetVpa] = useState('');

  const handleCheckComplete = (resultData) => {
    setLastCheckResult(resultData);
    if (resultData.extractedUpi) {
      setTargetVpa(resultData.extractedUpi);
    }
    setCurrentScreen('result');
  };

  const handleProceedToPay = (upi) => {
    if (upi) setTargetVpa(upi);
    setCurrentScreen('pay');
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-[#111827] flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Sophisticated Architectural Fintech Background Layer */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
        {/* Soft Radial Hero Light Effect */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-radial-hero opacity-90 animate-ambient-pulse" />
        
        {/* Extremely Subtle Architectural Grid with Soft Center-Fade */}
        <div className="absolute inset-0 bg-grid-fintech [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)] opacity-80" />

        {/* Delicate Architectural Boundary Guides (Desktop only) */}
        <div className="hidden xl:block absolute left-12 top-0 bottom-0 w-px bg-slate-200/40" />
        <div className="hidden xl:block absolute right-12 top-0 bottom-0 w-px bg-slate-200/40" />
        
        {/* Soft Restrained Blue Accent in lower quadrant */}
        <div className="absolute -bottom-48 right-10 w-96 h-96 rounded-full bg-blue-500/3 blur-3xl pointer-events-none" />
      </div>

      <Header currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-10">
        {currentScreen === 'check' && (
          <CheckScreen 
            onCheckComplete={handleCheckComplete} 
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            result={lastCheckResult}
            onProceedToPay={handleProceedToPay}
            onReset={() => setCurrentScreen('check')}
          />
        )}

        {currentScreen === 'pay' && (
          <PayScreen
            prefilledVpa={targetVpa}
            onBack={() => setCurrentScreen('check')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen />
        )}
      </main>

      <footer className="relative z-10 bg-[#F1F5F9]/80 border-t border-slate-200/80 py-5 mt-10 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111827] font-display tracking-tight">TrustLayer</span>
            <span className="text-slate-300">•</span>
            <span>Zero-Trust UPI Scam Guard Rail</span>
          </div>
          <div className="font-mono text-slate-400 text-[11px] flex items-center gap-2">
            <span>Dual-Engine (Heuristics + Gemini)</span>
            <span className="text-slate-300">•</span>
            <span>NPCI Standard URI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
