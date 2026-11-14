import React, { useCallback, useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import CheckScreen from './screens/CheckScreen';
import ResultScreen from './screens/ResultScreen';
import PayScreen from './screens/PayScreen';
import ThreatFeedScreen from './screens/ThreatFeedScreen';
import DashboardScreen from './screens/DashboardScreen';
import ImpactScreen from './screens/ImpactScreen';
import InclusionScreen from './screens/InclusionScreen';
import MoneyScreen from './screens/MoneyScreen';
import { ArrowLeft, PhoneCall } from 'lucide-react';

const SCREENS = ['home', 'check', 'result', 'pay', 'money', 'feed', 'impact', 'inclusion'];
const ALIASES = { dashboard: 'feed' }; // old links keep working

// Screens live in the URL hash so the phone's Back button moves between them
// instead of leaving the app.
function screenFromHash() {
  const raw = window.location.hash.replace('#/', '').replace('#', '');
  const s = ALIASES[raw] || raw;
  return SCREENS.includes(s) ? s : 'home';
}

function MainApp() {
  const { t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState(screenFromHash);
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const [targetVpa, setTargetVpa] = useState('');
  const [payContext, setPayContext] = useState(null);
  const [inspectorPrefill, setInspectorPrefill] = useState('');

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
    if (resultData.extractedUpi) setTargetVpa(resultData.extractedUpi);
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
    // Opening Safe Pay directly is a fresh payment, not tied to the last check
    if (screen === 'pay') setPayContext(null);
    if (screen === 'check') setInspectorPrefill('');
    go(screen);
  };

  // Threat Feed → "inspect this scenario" opens the checker with the text filled in
  const handleInspectScenario = (payloadText) => {
    setInspectorPrefill(payloadText);
    go('check');
  };

  // A result page needs a check; after a reload send the user back to the check screen
  const screen = currentScreen === 'result' && !lastCheckResult ? 'check' : currentScreen;

  return (
    <div className="relative min-h-screen bg-[#F3F6F4] text-[#0F1F17] flex flex-col selection:bg-[#A7F3D0] selection:text-[#0F1F17] overflow-x-hidden font-sans">
      {/* Sage & mint ambient lighting with a fine editorial grid */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-[#A7F3D0]/30 blur-[130px]" />
        <div className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full bg-[#D1FAE5]/40 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[#EAF0EB]/70 blur-[130px]" />
        <div className="absolute inset-0 bg-sage-grid [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_90%)] opacity-80" />
      </div>

      <Header onHome={() => go('home')} onOpenMoney={() => go('money')} />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-10">
        {screen !== 'home' && (
          <button
            type="button"
            onClick={() => go('home')}
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 h-10 pl-2.5 pr-4 rounded-xl text-sm font-semibold text-[#5C6B63] hover:text-[#0F1F17] hover:bg-white border border-transparent hover:border-[#D4E0D5] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </button>
        )}

        {screen === 'home' && <HomeScreen onNavigate={handleNavigate} />}

        {screen === 'check' && (
          <CheckScreen key={inspectorPrefill || 'blank'} onCheckComplete={handleCheckComplete} prefilledText={inspectorPrefill} />
        )}

        {screen === 'result' && (
          <ResultScreen result={lastCheckResult} onProceedToPay={handleProceedToPay} onReset={() => handleNavigate('check')} />
        )}

        {screen === 'pay' && (
          <PayScreen
            key={payContext?.checkId || 'direct'}
            prefilledVpa={targetVpa}
            prefill={payContext?.qr || null}
            payContext={payContext}
            onBack={() => handleNavigate('check')}
          />
        )}

        {screen === 'feed' && (
          <div className="space-y-12">
            {/* Live community stats + your private scan history (Firestore) */}
            <DashboardScreen />
            {/* Searchable catalogue of scam types with one-tap inspect */}
            <ThreatFeedScreen onInspectScenario={handleInspectScenario} />
          </div>
        )}

        {screen === 'impact' && <ImpactScreen />}

        {screen === 'money' && <MoneyScreen />}

        {screen === 'inclusion' && <InclusionScreen />}
      </main>

      <footer className="relative z-10 bg-[#EAF0EB] border-t border-[#D4E0D5] py-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5C6B63] gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-extrabold text-[#0F1F17] text-sm">TrustLayer</span>
            <span className="text-[#8E9C94]">•</span>
            <span className="font-medium">{t.footerTag}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-mono text-[11px]">Rules + Gemini + Grok • NPCI upi://pay</span>
            <a href="tel:1930" className="flex items-center gap-1.5 font-semibold text-[#BE123C] hover:text-[#9F1239]">
              <PhoneCall className="w-4 h-4" />
              {t.helpline}
            </a>
          </div>
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
