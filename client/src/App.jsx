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
    <div className="min-h-screen bg-canvas text-slate-900 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      <Header currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

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
            prefilledVpa={targetVpa}
            onBack={() => setCurrentScreen('check')}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen />
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
