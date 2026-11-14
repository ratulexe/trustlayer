import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Header from './components/Header';
import CheckScreen from './screens/CheckScreen';
import ResultScreen from './screens/ResultScreen';
import PayScreen from './screens/PayScreen';
import ThreatFeedScreen from './screens/ThreatFeedScreen';
import ImpactScreen from './screens/ImpactScreen';

function MainApp() {
  const { t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState('check');
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const [targetVpa, setTargetVpa] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [inspectorPrefill, setInspectorPrefill] = useState('');

  const handleCheckComplete = (resultData) => {
    setLastCheckResult(resultData);
    if (resultData.extractedUpi) {
      setTargetVpa(resultData.extractedUpi);
    }
    setCurrentScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToPay = (upi, amount) => {
    if (upi) setTargetVpa(upi);
    if (amount) setTargetAmount(amount);
    setCurrentScreen('pay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectScenario = (payloadText) => {
    setInspectorPrefill(payloadText);
    setCurrentScreen('check');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#F3F6F4] text-[#0F1F17] flex flex-col justify-between selection:bg-[#A7F3D0] selection:text-[#0F1F17] overflow-x-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* SAGE & MINT AMBIENT LIGHTING & EDITORIAL SUBTLE GRID */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
        {/* Mint Glow Upper Left */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-[#A7F3D0]/30 blur-[130px] pointer-events-none" />
        
        {/* Soft Sage Light Mid Right */}
        <div className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-[#D1FAE5]/40 blur-[140px] pointer-events-none" />
        
        {/* Calming Lower Glow */}
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[#EAF0EB]/70 blur-[130px] pointer-events-none" />
        
        {/* 40px Fine Architectural Grid with Soft Mask */}
        <div className="absolute inset-0 bg-sage-grid [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)] opacity-80 pointer-events-none" />
      </div>

      {/* Sticky Navigation Bar */}
      <Header currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

      {/* Main Dynamic Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {currentScreen === 'check' && (
          <CheckScreen 
            onCheckComplete={handleCheckComplete} 
            prefilledText={inspectorPrefill}
            onExploreProtection={() => setCurrentScreen('feed')}
          />
        )}

        {currentScreen === 'result' && (
          <ResultScreen
            result={lastCheckResult}
            onProceedToPay={handleProceedToPay}
            onReset={() => { setInspectorPrefill(''); setCurrentScreen('check'); }}
          />
        )}

        {currentScreen === 'pay' && (
          <PayScreen
            prefilledVpa={targetVpa}
            prefilledAmount={targetAmount}
            onBack={() => setCurrentScreen('check')}
          />
        )}

        {currentScreen === 'feed' && (
          <ThreatFeedScreen 
            onInspectScenario={handleInspectScenario}
          />
        )}

        {currentScreen === 'impact' && (
          <ImpactScreen />
        )}
      </main>

      {/* Editorial Sage Footer */}
      <footer className="relative z-10 bg-[#EAF0EB] border-t border-[#D4E0D5] py-7 mt-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5C6B63] gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-[#0F1F17] font-sans text-sm">TrustLayer</span>
            <span className="text-[#8E9C94]">•</span>
            <span className="font-medium">Zero-Trust UPI Scam Guard Rail & FinTech Threat Shield</span>
          </div>
          <div className="font-mono text-[11px] text-[#5C6B63] flex items-center gap-2.5">
            <span>Dual-Engine (Heuristics + Gemini 2.5)</span>
            <span className="text-[#8E9C94]">•</span>
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
