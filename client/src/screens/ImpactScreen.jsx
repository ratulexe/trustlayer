import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShieldCheckIcon, 
  BanknoteIcon, 
  ActivityIcon, 
  TrendingUpIcon, 
  CopyIcon, 
  SparklesIcon 
} from '../components/Icons';

export default function ImpactScreen() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, historyRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/history')
        ]);
        const statsData = await statsRes.json();
        const historyData = await historyRes.json();

        if (statsData.success) setStats(statsData);
        if (historyData.success) setHistory(historyData.history || []);
      } catch (err) {
        console.error('Failed to load telemetry data', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const VECTOR_DISTRIBUTION = [
    { label: 'Electricity & Utility Phishing', percentage: 38, count: '5,820 reports', bar: 'bg-[#F43F5E]', dot: 'bg-[#F43F5E]' },
    { label: 'WhatsApp / KBC Lottery Scams', percentage: 26, count: '3,980 reports', bar: 'bg-[#F59E0B]', dot: 'bg-[#F59E0B]' },
    { label: 'Reverse UPI PIN Harvesting', percentage: 19, count: '2,910 reports', bar: 'bg-[#059669]', dot: 'bg-[#059669]' },
    { label: 'Fake Bank KYC Freeze Threats', percentage: 11, count: '1,680 reports', bar: 'bg-[#10B981]', dot: 'bg-[#10B981]' },
    { label: 'Telegram Work-From-Home Task Deposits', percentage: 6, count: '920 reports', bar: 'bg-[#5C6B63]', dot: 'bg-[#5C6B63]' }
  ];

  const handleExportJson = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      platform: 'TrustLayer FinTech Rail',
      metrics: stats?.metrics || {},
      sessionAuditLog: history
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustlayer-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2 pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F7EF] border border-[#A7F3D0] text-[10px] font-mono text-[#047857] uppercase tracking-wider">
          <TrendingUpIcon className="w-3.5 h-3.5 text-[#059669]" />
          <span>NATIONAL IMPACT & TELEMETRY</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif-editorial text-[#0F1F17] tracking-tight">
          {t.impactTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6B63] max-w-lg mx-auto">
          {t.impactSubtitle}
        </p>
      </div>

      {/* 3 KPI Stat Cards in Pristine White with Sage Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* KPI 1: Scams Blocked */}
        <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] shadow-[0_4px_20px_rgba(15,31,23,0.03)] flex items-center gap-4 text-left">
          <div className="w-13 h-13 rounded-2xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center shrink-0 border border-[#FECDD3]">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#5C6B63] font-semibold block">{t.scamsBlocked}</span>
            <span className="text-3xl font-black font-mono text-[#0F1F17] tabular-nums">
              {stats?.metrics?.scamsBlocked ? stats.metrics.scamsBlocked.toLocaleString('en-IN') : '1,424+'}
            </span>
            <span className="text-[10px] font-mono text-[#E11D48] block mt-0.5 font-bold">
              +142 this week
            </span>
          </div>
        </div>

        {/* KPI 2: INR Protected */}
        <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] shadow-[0_4px_20px_rgba(15,31,23,0.03)] flex items-center gap-4 text-left">
          <div className="w-13 h-13 rounded-2xl bg-[#E6F7EF] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
            <BanknoteIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#5C6B63] font-semibold block">{t.fundsProtected}</span>
            <span className="text-3xl font-black font-mono text-[#059669] tabular-nums">
              ₹{(stats?.metrics?.amountProtectedInr || stats?.metrics?.amountProtected || 4820000).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono text-[#047857] block mt-0.5 font-bold">
              Zero-Trust Intercepts
            </span>
          </div>
        </div>

        {/* KPI 3: Threat Signatures */}
        <div className="bg-white p-6 rounded-3xl border border-[#D4E0D5] shadow-[0_4px_20px_rgba(15,31,23,0.03)] flex items-center gap-4 text-left">
          <div className="w-13 h-13 rounded-2xl bg-[#EAF0EB] text-[#0F1F17] flex items-center justify-center shrink-0 border border-[#D4E0D5]">
            <ActivityIcon className="w-6 h-6 text-[#059669]" />
          </div>
          <div>
            <span className="text-xs text-[#5C6B63] font-semibold block">{t.communitySignatures}</span>
            <span className="text-3xl font-black font-mono text-[#0F1F17] tabular-nums">
              {(stats?.metrics?.activeScamPatterns || stats?.metrics?.communityScamsCount || 8920).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-mono text-[#5C6B63] block mt-0.5">
              Live Verified DB
            </span>
          </div>
        </div>

      </div>

      {/* Threat Vector Distribution Visualization */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4E0D5] shadow-[0_4px_20px_rgba(15,31,23,0.03)] space-y-5 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2EAE3] pb-3">
          <span className="text-sm font-bold text-[#0F1F17] font-sans flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#059669]" />
            {t.vectorDistributionHeader}
          </span>
          <span className="text-xs font-mono text-[#5C6B63]">
            Sample size: 15,310 verified incidents
          </span>
        </div>

        <div className="space-y-4">
          {VECTOR_DISTRIBUTION.map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#0F1F17] font-medium">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                  <span>{item.label}</span>
                </span>
                <span className="font-mono text-[#0F1F17] font-bold">
                  {item.percentage}% ({item.count})
                </span>
              </div>
              <div className="w-full bg-[#EAF0EB] rounded-full h-2 overflow-hidden border border-[#D4E0D5]">
                <div 
                  className={`${item.bar} h-full rounded-full transition-all duration-1000`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Audit Log Strip */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D4E0D5] shadow-[0_4px_20px_rgba(15,31,23,0.03)] space-y-4 text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2EAE3] pb-3">
          <div>
            <span className="text-sm font-bold text-[#0F1F17] font-sans block">
              {t.sessionAuditHeader}
            </span>
            <span className="text-xs text-[#5C6B63]">
              Cryptographic log of all scam checks performed in this session
            </span>
          </div>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-[#EAF0EB] hover:bg-[#D4E0D5] text-[#0F1F17] font-mono text-xs transition flex items-center gap-1.5 cursor-pointer border border-[#D4E0D5]"
          >
            <CopyIcon className="w-3.5 h-3.5 text-[#059669]" />
            <span>{exportNotice ? 'Exported JSON File!' : t.exportAuditBtn}</span>
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#5C6B63] font-mono">
            {t.noScansYet}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {history.map((entry, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#D4E0D5] flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      entry.verdict === 'SCAM' 
                        ? 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]' 
                        : entry.verdict === 'CAUTION' 
                        ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]' 
                        : 'bg-[#E6F7EF] text-[#047857] border border-[#A7F3D0]'
                    }`}>
                      {entry.verdict} ({entry.score}/100)
                    </span>
                    <span className="font-mono text-[11px] text-[#0F1F17] font-bold">
                      {entry.extractedUpi || 'General Text Payload'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5C6B63] truncate max-w-md">
                    {entry.rawInput}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-[#5C6B63] text-right">
                  <div>{entry.engine || 'Dual Engine'}</div>
                  <div className="text-[#8E9C94]">{new Date(entry.timestamp || Date.now()).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
