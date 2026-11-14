import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ShieldCheckIcon, 
  BanknoteIcon, 
  ActivityIcon 
} from '../components/Icons';

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
    <div className="max-w-4xl mx-auto space-y-7">
      
      {/* Title */}
      <div className="text-center space-y-1.5 pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-display">
          {t.dashTitle}
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Real-time aggregated threat intelligence across Indian UPI networks
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(23,37,84,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/80">
            <ShieldCheckIcon className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-semibold block">{t.scamsBlocked}</span>
            <span className="text-2xl font-black font-mono text-[#111827]">
              {stats?.metrics?.scamsBlocked ? stats.metrics.scamsBlocked.toLocaleString('en-IN') : '1,420+'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(23,37,84,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/80">
            <BanknoteIcon className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-semibold block">{t.fundsProtected}</span>
            <span className="text-2xl font-black font-mono text-emerald-600">
              ₹48.2 L
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-[0_2px_8px_-2px_rgba(23,37,84,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/80">
            <ActivityIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <span className="text-xs text-[#64748B] font-semibold block">{t.activeThreats}</span>
            <span className="text-2xl font-black font-mono text-blue-600">
              {stats?.metrics?.activeScamPatterns || 42}
            </span>
          </div>
        </div>

      </div>

      {/* Two Columns: Trending Scams & Recent User Scans with Alternating Section Tones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trending Scams (Crisp White Surface) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(23,37,84,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-[#111827] font-display">
              {t.trendingHeader}
            </h3>
            <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
              HIGH ALERT
            </span>
          </div>

          <div className="space-y-3">
            {(stats?.trendingScams || []).map((scam, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#FAFAF8] border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#111827] font-display">{scam.title}</span>
                  <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                    {scam.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed">
                  {scam.description}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                  Regions: {scam.affectedRegions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Recent Checks (Cool Slate #F1F5F9 Background Tone) */}
        <div className="bg-[#F1F5F9]/80 rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(23,37,84,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h3 className="font-bold text-sm text-[#111827] font-display">
              {t.recentHeader}
            </h3>
            <span className="text-[10px] font-mono text-[#64748B] bg-white px-2 py-0.5 rounded border border-slate-200">
              Local Session
            </span>
          </div>

          <div className="space-y-2.5">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></span>
                <span>Loading intelligence feed...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#64748B]">
                No scans performed yet in this session.
              </div>
            ) : (
              history.slice(0, 5).map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs shadow-xs">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-mono text-[11px] text-[#111827] truncate">{item.snippet}</p>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                    item.verdict === 'SCAM' 
                      ? 'bg-rose-50 text-rose-800 border-rose-200' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
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
