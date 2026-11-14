import React, { useState } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import CheckScreen from './screens/CheckScreen';
import ResultScreen from './screens/ResultScreen';
import PayScreen from './screens/PayScreen';
import DashboardScreen from './screens/DashboardScreen';
import InclusionScreen from './screens/InclusionScreen';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('check');
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const [targetVpa, setTargetVpa] = useState('');
  const [payContext, setPayContext] = useState(null);

  const handleCheckComplete = (resultData) => {
    // receivedAt anchors the Caution cool-down so it survives screen changes
    setLastCheckResult({ ...resultData, receivedAt: Date.now() });
    if (resultData.extractedUpi) {
      setTargetVpa(resultData.extractedUpi);
    }
    setPayContext(null);
    setCurrentScreen('result');
  };

  const handleProceedToPay = (upi, { cautionAcknowledged = false } = {}) => {
    if (upi) setTargetVpa(upi);
    setPayContext({
      checkId: lastCheckResult?.checkId || null,
      checkedUpi: upi || null,
      cautionAcknowledged
    });
    setCurrentScreen('pay');
  };

  const handleNavigate = (screen) => {
    // Opening Safe Pay from the header is a fresh payment, not tied to the last check
    if (screen === 'pay') setPayContext(null);
    setCurrentScreen(screen);
  };

  return (
    <div className="min-h-screen bg-canvas text-slate-900 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Header currentScreen={currentScreen} setCurrentScreen={handleNavigate} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
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
            key={payContext?.checkId || 'direct'}
            prefilledVpa={targetVpa}
            payContext={payContext}
            onBack={() => setCurrentScreen('check')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen />
        )}

        {currentScreen === 'inclusion' && (
          <InclusionScreen />
        )}
      </main>

      <footer className="bg-surface border-t border-slate-200 py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-display">TrustLayer</span>
            <span>• Financial Technology & Payments Track</span>
          </div>
          <div className="font-mono text-slate-400 text-[11px]">
            React + Vite PWA • Kanchenjunga Font • Dual-Engine Heuristics + Gemini
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
