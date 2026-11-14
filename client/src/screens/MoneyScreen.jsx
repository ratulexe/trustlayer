import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getDeviceId, formatInr, fillTemplate } from '../utils/deviceId';
import {
  Wallet, Banknote, Smartphone, ArrowDownLeft, ArrowUpRight, PiggyBank, Trash2,
  Gauge, Lightbulb, Landmark, Plus, Database, Target
} from 'lucide-react';

const EXPENSE_CATEGORIES = ['groceries', 'rent', 'bills', 'transport', 'health', 'education', 'family', 'eating_out', 'shopping', 'entertainment', 'other'];
const INCOME_CATEGORIES = ['wages', 'business', 'family_support', 'other_income'];

const localToday = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in the user's timezone

const TIER_STYLE = {
  excellent: { text: 'text-emerald-600', bg: 'bg-emerald-500', pill: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  good: { text: 'text-brand-600', bg: 'bg-brand-500', pill: 'bg-brand-50 border-brand-100 text-brand-700' },
  fair: { text: 'text-amber-600', bg: 'bg-amber-500', pill: 'bg-amber-50 border-amber-200 text-amber-700' },
  building: { text: 'text-[#5C6B63]', bg: 'bg-slate-400', pill: 'bg-[#F7FAF8] border-[#D4E0D5] text-[#24352C]' }
};

async function api(path, options = {}, fetcher = fetch) {
  const res = await fetcher(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="sage-card rounded-3xl p-4">
      <div className="flex items-center gap-2 text-xs text-[#5C6B63] font-semibold">
        <Icon className={`w-4 h-4 ${tone}`} />
        <span>{label}</span>
      </div>
      <div className={`mt-1 text-xl font-black font-mono ${tone}`}>{value}</div>
    </div>
  );
}

function SegButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
        active ? 'bg-surface text-[#0F1F17] shadow-sm border border-[#D4E0D5] font-bold' : 'text-[#5C6B63] hover:text-[#0F1F17]'
      }`}
    >
      {children}
    </button>
  );
}

export default function MoneyScreen() {
  const { t } = useLanguage();
  const { authFetch, user } = useAuth();
  const deviceId = getDeviceId();
  // Signed-in users' diary follows their Google account; otherwise it stays on this phone
  const call = useCallback((path, options) => api(path, options, authFetch), [authFetch]);
  const uid = user?.uid;

  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');

  // Entry form
  const [type, setType] = useState('expense');
  const [mode, setMode] = useState('cash');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('groceries');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(localToday());
  const [isSaving, setIsSaving] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const refresh = useCallback(async () => {
    try {
      const month = localToday().slice(0, 7);
      const [s, l, h] = await Promise.all([
        call(`/api/finance/summary?deviceId=${deviceId}&month=${month}`),
        call(`/api/finance/transactions?deviceId=${deviceId}&limit=15`),
        call(`/api/finance/health-score?deviceId=${deviceId}`)
      ]);
      setSummary(s.summary);
      setTxns(l.transactions);
      setHealth(h.healthScore);
      setBudgetInput(s.summary.budget ? String(s.summary.budget) : '');
      setError('');
    } catch {
      setError(t.errorGeneric);
    }
  }, [deviceId, t.errorGeneric, call, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [refresh]);

  const switchType = (next) => {
    setType(next);
    setCategory(next === 'income' ? 'wages' : 'groceries');
    if (next === 'withdrawal') setMode('cash');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await call('/api/finance/transactions', {
        method: 'POST',
        body: JSON.stringify({ deviceId, type, mode, amount: Number(amount), category, note, date })
      });
      setAmount('');
      setNote('');
      await refresh();
    } catch {
      setError(t.errorGeneric);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await call(`/api/finance/transactions/${id}?deviceId=${deviceId}`, { method: 'DELETE' });
      await refresh();
    } catch {
      setError(t.errorGeneric);
    }
  };

  const handleBudget = async (e) => {
    e.preventDefault();
    try {
      await call('/api/finance/budget', {
        method: 'PUT',
        body: JSON.stringify({ deviceId, monthlyBudget: budgetInput === '' ? null : Number(budgetInput) })
      });
      await refresh();
    } catch {
      setError(t.errorGeneric);
    }
  };

  const handleSeed = async () => {
    if (txns.length > 0 && !window.confirm(t.loadSampleConfirm)) return;
    try {
      await call('/api/finance/demo-seed', { method: 'POST', body: JSON.stringify({ deviceId }) });
      await refresh();
    } catch {
      setError(t.errorGeneric);
    }
  };

  const cashSpend = summary?.byMode.cash.expense || 0;
  const upiSpend = summary?.byMode.upi.expense || 0;
  const cashPct = summary?.expense ? Math.round((cashSpend / summary.expense) * 100) : 0;
  const budgetPct = summary?.budget ? Math.min(100, Math.round((summary.budgetUsed || 0) * 100)) : 0;
  const budgetTone = summary?.budgetStatus === 'over' ? 'bg-rose-500' : summary?.budgetStatus === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const inputClass = 'w-full bg-[#F7FAF8] border border-[#D4E0D5] rounded-xl px-3 py-2.5 text-[#0F1F17] text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold text-[#0F1F17] tracking-tight font-display">{t.moneyTitle}</h2>
        <p className="text-sm text-[#5C6B63]">{t.moneySubtitle}</p>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>
      )}

      {/* This month */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">{t.thisMonth}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={ArrowDownLeft} label={t.incomeLabel} value={formatInr(summary?.income)} tone="text-emerald-600" />
          <StatCard icon={ArrowUpRight} label={t.spentLabel} value={formatInr(summary?.expense)} tone="text-rose-600" />
          <StatCard icon={PiggyBank} label={t.savedLabel} value={formatInr(summary?.saved)} tone={(summary?.saved || 0) >= 0 ? 'text-brand-600' : 'text-rose-600'} />
          <StatCard icon={Wallet} label={t.cashInHand} value={formatInr(summary?.cashInHand)} tone="text-[#0F1F17]" />
        </div>
        {summary && summary.cashInHand < 0 && (
          <p className="text-xs text-amber-700">{t.cashInHandNegative}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: entry + breakdown + list */}
        <div className="lg:col-span-3 space-y-6">
          {/* Add entry */}
          <form onSubmit={handleAdd} className="sage-card rounded-3xl p-4 sm:p-5 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#0F1F17] font-display flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-600" />
              {t.addEntry}
            </h3>

            <div className="flex gap-1 bg-[#EAF0EB] p-1 rounded-xl border border-[#D4E0D5]">
              <SegButton active={type === 'expense'} onClick={() => switchType('expense')}>{t.typeExpense}</SegButton>
              <SegButton active={type === 'income'} onClick={() => switchType('income')}>{t.typeIncome}</SegButton>
              <SegButton active={type === 'withdrawal'} onClick={() => switchType('withdrawal')}>{t.typeWithdrawal}</SegButton>
            </div>

            {type !== 'withdrawal' && (
              <div>
                <span className="block text-[#24352C] font-semibold mb-1">{type === 'income' ? t.receivedAs : t.paidWith}</span>
                <div className="flex gap-1 bg-[#EAF0EB] p-1 rounded-xl border border-[#D4E0D5]">
                  <SegButton active={mode === 'cash'} onClick={() => setMode('cash')}>
                    <Banknote className="w-3.5 h-3.5" /> {t.modeCash}
                  </SegButton>
                  <SegButton active={mode === 'upi'} onClick={() => setMode('upi')}>
                    <Smartphone className="w-3.5 h-3.5" /> {t.modeUpi}
                  </SegButton>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-[#24352C] font-semibold mb-1">{t.amountShort}</span>
                <input type="number" inputMode="decimal" min="1" step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} className={`${inputClass} font-mono font-bold`} />
              </label>
              <label className="block">
                <span className="block text-[#24352C] font-semibold mb-1">{t.dateLabel}</span>
                <input type="date" required max={localToday()} value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
              </label>
            </div>

            {type !== 'withdrawal' && (
              <label className="block">
                <span className="block text-[#24352C] font-semibold mb-1">{t.categoryLabel}</span>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{t[`cat_${c}`]}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="block text-[#24352C] font-semibold mb-1">{t.noteLabel}</span>
              <input type="text" maxLength={120} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
            </label>

            <button type="submit" disabled={isSaving} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-bold text-sm shadow-float transition font-display">
              {isSaving ? t.saving : t.saveEntry}
            </button>
          </form>

          {/* Cash vs UPI + categories */}
          {summary && summary.expense > 0 && (
            <div className="sage-card rounded-3xl p-4 sm:p-5 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">{t.cashVsUpi}</h3>
                <div className="flex h-3 rounded-full overflow-hidden bg-[#EAF0EB]" aria-hidden="true">
                  <div className="bg-amber-500" style={{ width: `${cashPct}%` }} />
                  <div className="bg-brand-500" style={{ width: `${100 - cashPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-[#5C6B63]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{t.modeCash}: <strong className="font-mono">{formatInr(cashSpend)}</strong> ({cashPct}%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500" />{t.modeUpi}: <strong className="font-mono">{formatInr(upiSpend)}</strong> ({100 - cashPct}%)</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">{t.categoryBreakdown}</h3>
                {summary.categories.slice(0, 6).map((c) => (
                  <div key={c.category} className="text-xs">
                    <div className="flex justify-between text-[#24352C]">
                      <span>{t[`cat_${c.category}`] || c.category}</span>
                      <span className="font-mono font-semibold">{formatInr(c.amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#EAF0EB] mt-1">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${Math.round(c.share * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent entries */}
          <div className="sage-card rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">{t.recentEntries}</h3>
              <button type="button" onClick={handleSeed} className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <Database className="w-3.5 h-3.5" /> {t.loadSample}
              </button>
            </div>
            {txns.length === 0 ? (
              <p className="text-xs text-[#5C6B63]">{t.noEntries}</p>
            ) : (
              <ul className="divide-y divide-[#E2EAE3]">
                {txns.map((x) => {
                  const isIn = x.type !== 'expense';
                  return (
                    <li key={x.id} className="py-2.5 flex items-center gap-3 text-xs">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${x.mode === 'cash' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-brand-50 border-brand-100 text-brand-600'}`}>
                        {x.mode === 'cash' ? <Banknote className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-[#0F1F17] truncate">{t[`cat_${x.category}`] || x.category}{x.note ? ` · ${x.note}` : ''}</div>
                        <div className="text-xs text-[#5C6B63]">{x.date} · {x.mode === 'cash' ? t.modeCash : t.modeUpi}</div>
                      </div>
                      <span className={`font-mono font-bold ${x.type === 'withdrawal' ? 'text-[#5C6B63]' : isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {x.type === 'expense' ? '−' : '+'}{formatInr(x.amount)}
                      </span>
                      <button type="button" onClick={() => handleDelete(x.id)} aria-label={t.deleteEntry} title={t.deleteEntry} className="p-1.5 rounded-lg text-[#8E9C94] hover:text-rose-600 hover:bg-rose-50 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Right: health score + budget */}
        <div className="lg:col-span-2 space-y-6">
          <HealthScoreCard health={health} />

          <form onSubmit={handleBudget} className="sage-card rounded-3xl p-4 sm:p-5 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-[#0F1F17] font-display flex items-center gap-2">
              <Target className="w-4 h-4 text-brand-600" />
              {t.budgetTitle}
            </h3>
            <div className="flex gap-2">
              <input type="number" inputMode="numeric" min="1" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} aria-label={t.budgetTitle} className={`${inputClass} font-mono`} />
              <button type="submit" className="px-3 rounded-xl bg-[#0F1F17] hover:bg-[#24352C] text-white font-bold whitespace-nowrap">{t.budgetSet}</button>
            </div>
            {summary?.budget ? (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-[#EAF0EB]">
                  <div className={`h-2 rounded-full ${budgetTone}`} style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="flex justify-between text-[#5C6B63]">
                  <span>{summary.budgetStatus === 'over' ? t.budgetOver : summary.budgetStatus === 'warning' ? t.budgetWarning : t.budgetOk}</span>
                  <span className="font-mono">{formatInr(summary.expense)} / {formatInr(summary.budget)}</span>
                </div>
              </div>
            ) : (
              <p className="text-[#5C6B63]">{t.budgetNone}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function HealthScoreCard({ health }) {
  const { t } = useLanguage();

  if (!health) return null;

  if (health.status !== 'ok') {
    return (
      <div className="sage-card rounded-3xl p-4 sm:p-5 space-y-2 text-xs">
        <h3 className="text-sm font-bold text-[#0F1F17] font-display flex items-center gap-2">
          <Gauge className="w-4 h-4 text-brand-600" />
          {t.healthTitle}
        </h3>
        <p className="text-[#5C6B63]">{t.healthSubtitle}</p>
        <p className="text-[#24352C]">{fillTemplate(t.healthInsufficient, health.needed)}</p>
        <p className="text-[#5C6B63]">{fillTemplate(t.healthProgress, health.have)}</p>
      </div>
    );
  }

  const style = TIER_STYLE[health.tier] || TIER_STYLE.building;
  const position = Math.round(((health.score - 300) / 600) * 100);

  return (
    <div className="sage-card rounded-3xl p-4 sm:p-5 space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[#0F1F17] font-display flex items-center gap-2">
          <Gauge className="w-4 h-4 text-brand-600" />
          {t.healthTitle}
        </h3>
        <p className="text-[#5C6B63] mt-0.5">{t.healthSubtitle}</p>
      </div>

      <div className="flex items-end justify-between">
        <span className={`text-4xl font-black font-mono ${style.text}`}>{health.score}</span>
        <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${style.pill}`}>{t[`tier_${health.tier}`]}</span>
      </div>
      <div>
        <div className="h-2 rounded-full bg-[#EAF0EB] relative" role="img" aria-label={`${health.score} / 900`}>
          <div className={`h-2 rounded-full ${style.bg}`} style={{ width: `${position}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-[#8E9C94] font-mono mt-1">
          <span>300</span><span>900</span>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#5C6B63] font-display">{t.factorsHeader}</h4>
        {health.factors.map((f) => (
          <div key={f.key}>
            <div className="flex justify-between text-[#24352C]">
              <span>{t[`factor_${f.key}`]} <span className="text-[#8E9C94]">· {f.weight}% {t.weightLabel}</span></span>
              <span className="font-mono font-semibold">{f.score}/100</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#EAF0EB] mt-1">
              <div className={`h-1.5 rounded-full ${f.score >= 70 ? 'bg-emerald-500' : f.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${f.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {health.tips.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
          <h4 className="font-bold text-amber-900 flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />{t.tipsHeader}</h4>
          <ul className="list-disc pl-4 space-y-1 text-amber-900">
            {health.tips.map((k) => <li key={k}>{t[`tip_${k}`]}</li>)}
          </ul>
        </div>
      )}

      <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#D4E0D5] space-y-1">
        <div className="font-bold text-[#0F1F17] flex items-center gap-1.5"><Landmark className="w-3.5 h-3.5 text-brand-600" />{t.loanEligible}</div>
        {health.eligibility.eligible ? (
          <>
            <div className="text-lg font-black font-mono text-[#0F1F17]">{formatInr(health.eligibility.loanLimit)}</div>
            <div className="text-[#5C6B63]">{t.loanEmi} <strong className="font-mono">{formatInr(health.eligibility.maxMonthlyEmi)}</strong></div>
          </>
        ) : (
          <div className="text-[#5C6B63]">{t.loanNotEligible}</div>
        )}
        <div className="text-[11px] text-[#8E9C94]">{t.loanDisclaimer}</div>
      </div>
    </div>
  );
}
