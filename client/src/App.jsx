import React, { useCallback, useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import CheckScreen from './screens/CheckScreen';
import ResultScreen from './screens/ResultScreen';
import PayScreen from './screens/PayScreen';
import DashboardScreen from './screens/DashboardScreen';
import InclusionScreen from './screens/InclusionScreen';
import MoneyScreen from './screens/MoneyScreen';
import { ArrowLeft, PhoneCall } from 'lucide-react';

const SCREENS = ['home', 'check', 'result', 'pay', 'money', 'dashboard', 'inclusion'];

// Screens live in the URL hash so the phone's Back button moves between them
// instead of leaving the app.
function screenFromHash() {
  const s = window.location.hash.replace('#/', '').replace('#', '');
  return SCREENS.includes(s) ? s : 'home';
}

function MainApp() {
  const { t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState(screenFromHash);
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const [targetVpa, setTargetVpa] = useState('');
  const [payContext, setPayContext] = useState(null);

  useEffect(() => {
    const onHash = () => setCurrentScreen(screenFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((screen) => {
    const hash = screen === 'home' ? '#/' : `#/${screen}`;
    if (window.location.hash !== hash) window.location.hash = hash;
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCheckComplete = (resultData) => {
    // receivedAt anchors the Caution cool-down so it survives screen changes
    setLastCheckResult({ ...resultData, receivedAt: Date.now() });
    if (resultData.extractedUpi) {
      setTargetVpa(resultData.extractedUpi);
    }
    setPayContext(null);
    go('result');
  };

  const handleProceedToPay = (upi, { cautionAcknowledged = false } = {}) => {
    if (upi) setTargetVpa(upi);
    setPayContext({
      checkId: lastCheckResult?.checkId || null,
      checkedUpi: upi || null,
      qr: lastCheckResult?.qr || null,
      cautionAcknowledged
    });
    go('pay');
  };

  const handleNavigate = (screen) => {
    // Opening Safe Pay from home is a fresh payment, not tied to the last check
    if (screen === 'pay') setPayContext(null);
    go(screen);
  };

  // A result page needs a check; after a reload send the user back to the check screen
  const screen = currentScreen === 'result' && !lastCheckResult ? 'check' : currentScreen;

  return (
    <div className="min-h-screen text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      <Header onHome={() => go('home')} onOpenMoney={() => go('money')} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-10 sm:pt-6">
        {screen !== 'home' && (
          <button
            type="button"
            onClick={() => go('home')}
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 h-10 pl-2.5 pr-4 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </button>
        )}

        {screen === 'home' && <HomeScreen onNavigate={handleNavigate} />}

        {screen === 'check' && <CheckScreen onCheckComplete={handleCheckComplete} />}

        {screen === 'result' && (
          <ResultScreen result={lastCheckResult} onProceedToPay={handleProceedToPay} onReset={() => go('check')} />
        )}

        {screen === 'pay' && (
          <PayScreen
            key={payContext?.checkId || 'direct'}
            prefilledVpa={targetVpa}
            prefill={payContext?.qr || null}
            payContext={payContext}
            onBack={() => go('check')}
          />
        )}

        {screen === 'dashboard' && <DashboardScreen />}

        {screen === 'money' && <MoneyScreen />}

        {screen === 'inclusion' && <InclusionScreen />}
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 font-display">TrustLayer</span>
            <span>· {t.footerTag}</span>
          </div>
          <a href="tel:1930" className="flex items-center gap-1.5 font-semibold text-rose-600 hover:text-rose-700">
            <PhoneCall className="w-4 h-4" />
            {t.helpline}
          </a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
