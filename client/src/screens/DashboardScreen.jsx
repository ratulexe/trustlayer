import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, IndianRupee, Zap, AlertTriangle, History } from 'lucide-react';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
          {t.dashTitle}
        </h2>
        <p className="text-xs text-slate-500">
          Real-time aggregated threat intelligence across Indian UPI networks
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-surface rounded-2xl p-5 border border-slate-200 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">{t.scamsBlocked}</span>
            <span className="text-2xl font-black font-mono text-slate-900">
              {stats?.metrics?.scamsBlocked ? stats.metrics.scamsBlocked.toLocaleString('en-IN') : '1,420+'}
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-slate-200 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">{t.fundsProtected}</span>
            <span className="text-2xl font-black font-mono text-emerald-600">
              ₹48.2 L
            </span>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-5 border border-slate-200 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
            <Zap className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">{t.activeThreats}</span>
            <span className="text-2xl font-black font-mono text-brand-600">
              {stats?.metrics?.activeScamPatterns || 42}
            </span>
          </div>
        </div>

      </div>

      {/* Two Columns: Trending Scams & Recent User Scans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trending Scams */}
        <div className="bg-surface rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900 font-display">
                {t.trendingHeader}
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
              HIGH ALERT
            </span>
          </div>

          <div className="space-y-3">
            {(stats?.trendingScams || []).map((scam, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 font-display">{scam.title}</span>
                  <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    {scam.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {scam.description}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Regions: {scam.affectedRegions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Recent Checks */}
        <div className="bg-surface rounded-2xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-sm text-slate-900 font-display">
                {t.recentHeader}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Local Session
            </span>
          </div>

          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No scans performed yet in this session.
              </div>
            ) : (
              history.slice(0, 5).map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-mono text-[11px] text-slate-800 truncate">{item.snippet}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    item.verdict === 'SCAM' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.verdict} ({item.score})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
