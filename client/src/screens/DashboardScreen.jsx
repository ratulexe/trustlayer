import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceId, formatInr } from '../utils/deviceId';
import { ShieldCheck, IndianRupee, Zap, AlertTriangle, History, Flag, BookOpen, Link, KeyRound, AlertOctagon, PhoneCall } from 'lucide-react';

export default function DashboardScreen() {
  const { t } = useLanguage();
  const auth = useAuth();
  const authFetch = auth?.authFetch || fetch;
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const deviceId = getDeviceId();
        const [statsRes, historyRes] = await Promise.all([
          fetch('/api/stats'),
          authFetch(`/api/history?deviceId=${encodeURIComponent(deviceId)}&limit=20`)
        ]);
        const statsData = await statsRes.json();
        const historyData = await historyRes.json();

        if (statsData.success) setStats(statsData);
        if (historyData.success) setHistory(historyData.history || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      }
    }
    fetchData();
  }, [authFetch]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title & Live Status */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold text-[#0F1F17] tracking-tight font-display">
            {t.dashTitle}
          </h2>
          {stats?.source && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
              stats.source === 'live'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-[#EAF0EB] text-[#5C6B63] border-[#D4E0D5]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${stats.source === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {stats.source === 'live' ? (t.liveBadge || 'Live') : (t.sessionBadge || 'This session')}
            </span>
          )}
        </div>
        <p className="text-sm text-[#5C6B63]">
          Real-time aggregated threat intelligence across Indian UPI networks
        </p>
      </div>

      {/* Metrics Row — 4 responsive cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Scams Blocked */}
        <div className="sage-card rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <ShieldCheck className="w-5 h-5 text-rose-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#5C6B63] font-semibold block truncate">{t.scamsBlocked}</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#0F1F17] truncate block">
              {Number(stats?.metrics?.scamsBlocked ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Funds Protected */}
        <div className="sage-card rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#5C6B63] font-semibold block truncate">{t.fundsProtected}</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 truncate block">
              {formatInr(stats?.metrics?.amountProtectedInr ?? 0)}
            </span>
          </div>
        </div>

        {/* Active Threats */}
        <div className="sage-card rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
            <Zap className="w-5 h-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#5C6B63] font-semibold block truncate">{t.activeThreats}</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-brand-600 truncate block">
              {Number(stats?.metrics?.activeScamPatterns ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Community Reports */}
        <div className="sage-card rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Flag className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-[#5C6B63] font-semibold block truncate">{t.communityReports || 'Community Reports'}</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-600 truncate block">
              {Number(stats?.metrics?.communityReports ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

      </div>

      {/* Two Columns: Trending Scams & Recent User Scans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trending Scams */}
        <div className="sage-card rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2EAE3] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-[#0F1F17] font-display">
                {t.trendingHeader}
              </h3>
            </div>
            <span className="text-[11px] font-mono bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200 font-bold">
              HIGH ALERT
            </span>
          </div>

          <div className="space-y-3">
            {(stats?.trendingScams || []).map((scam, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-[#0F1F17] font-display truncate">{scam.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {scam.count !== undefined && (
                      <span className="text-[10px] font-mono font-bold text-[#5C6B63] bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {scam.count} reported
                      </span>
                    )}
                    <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                      {scam.severity}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#5C6B63] leading-relaxed">
                  {scam.description}
                </p>
                <div className="text-[11px] text-[#8E9C94] font-mono pt-1">
                  Regions: {Array.isArray(scam.affectedRegions) ? scam.affectedRegions.join(', ') : 'All India'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Recent Checks (Private to this owner) */}
        <div className="sage-card rounded-3xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2EAE3] pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#5C6B63]" />
              <h3 className="font-bold text-sm text-[#0F1F17] font-display">
                {t.recentHeader}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#8E9C94]">
              Private
            </span>
          </div>

          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8E9C94]">
                No scans performed yet on this device.
              </div>
            ) : (
              history.slice(0, 5).map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] flex items-center justify-between text-xs gap-3">
                  <div className="space-y-0.5 min-w-0 max-w-[70%]">
                    <p className="font-mono text-xs text-[#0F1F17] truncate">{item.snippet}</p>
                    <span className="text-[11px] text-[#8E9C94] font-mono">
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono shrink-0 ${
                    item.verdict === 'SCAM' ? 'bg-rose-100 text-rose-800' : item.verdict === 'CAUTION' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.verdict} ({item.score})
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Cyber Security Advisories & Scam Defense Section */}
      <section className="bg-surface rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600 shrink-0" />
            <h3 className="font-bold text-base text-slate-900 font-display">
              {t.advisoryTitle || 'Cyber Security Advisories & Scam Defense'}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {t.advisorySub || 'Essential rules to protect yourself against online fraud'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Tip 1: Never Click Random Links */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                  <Link className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 font-display truncate">
                  {t.tipLinkTitle || 'Do not click random links in SMS or WhatsApp'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded shrink-0">
                {t.tipLinkTag || 'NEVER CLICK'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              {t.tipLinkDesc}
            </p>
          </div>

          {/* Tip 2: No PIN for Receiving Money */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                  <KeyRound className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 font-display truncate">
                  {t.tipPinTitle || 'You never need a UPI PIN to receive money'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded shrink-0">
                {t.tipPinTag || 'NO PIN'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              {t.tipPinDesc}
            </p>
          </div>

          {/* Tip 3: Beware of Artificial Urgency */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-brand-600 border border-indigo-100 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 font-display truncate">
                  {t.tipUrgencyTitle || 'Beware of artificial panic and countdowns'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded shrink-0">
                {t.tipUrgencyTag || 'FAKE URGENCY'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              {t.tipUrgencyDesc}
            </p>
          </div>

          {/* Tip 4: Golden Hour 1930 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-slate-300 transition">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-3.5 h-3.5" />
                </span>
                <span className="font-bold text-xs sm:text-sm text-slate-900 font-display truncate">
                  {t.tipHelplineTitle || 'Report immediately to National Cyber Cell (1930)'}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded shrink-0">
                {t.tipHelplineTag || 'GOLDEN HOUR'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pl-9">
              {t.tipHelplineDesc}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
