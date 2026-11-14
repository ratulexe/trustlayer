// Personal finance engine: cash + UPI money diary, monthly summary,
// and an explainable Financial Health Score (300–900) for thin-file users.
// Pure functions only — no I/O — so the model is easy to test and explain.

const EXPENSE_CATEGORIES = ['groceries', 'rent', 'bills', 'transport', 'health', 'education', 'family', 'eating_out', 'shopping', 'entertainment', 'other'];
const INCOME_CATEGORIES = ['wages', 'business', 'family_support', 'other_income'];
const ESSENTIAL_CATEGORIES = new Set(['groceries', 'rent', 'bills', 'transport', 'health', 'education', 'family']);
// Planned monthly commitments are lumpy by design, so they are left out of the stability factor
const FIXED_CATEGORIES = new Set(['rent', 'bills', 'family', 'education']);

const TYPES = ['expense', 'income', 'withdrawal'];
const MODES = ['cash', 'upi'];

const DAY_MS = 24 * 60 * 60 * 1000;
const SCORE_WINDOW_DAYS = 90;
const MIN_DAYS_FOR_SCORE = 14;
const MIN_TXNS_FOR_SCORE = 10;
const LOAN_CAP_INR = 50000;

const FACTOR_WEIGHTS = {
  savingsRate: 25,
  incomeRegularity: 20,
  spendingStability: 15,
  budgetDiscipline: 15,
  essentialShare: 10,
  recordConsistency: 15
};

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const round = (x) => Math.round(x);

function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

function toDayNumber(isoDate) {
  return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / DAY_MS);
}

/** Validates and normalises a transaction. Returns { value } or { error }. */
function validateTransaction(input = {}, now = new Date()) {
  const type = String(input.type || '').toLowerCase();
  if (!TYPES.includes(type)) return { error: `type must be one of ${TYPES.join(', ')}` };

  // An ATM withdrawal always moves bank money into cash
  const mode = type === 'withdrawal' ? 'cash' : String(input.mode || '').toLowerCase();
  if (!MODES.includes(mode)) return { error: 'mode must be cash or upi' };

  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) {
    return { error: 'amount must be a positive number up to 1,00,00,000' };
  }

  let category = String(input.category || '').toLowerCase();
  if (type === 'withdrawal') category = 'atm';
  else if (type === 'expense' && !EXPENSE_CATEGORIES.includes(category)) return { error: 'invalid expense category' };
  else if (type === 'income' && !INCOME_CATEGORIES.includes(category)) return { error: 'invalid income category' };

  const date = input.date ? String(input.date) : todayIso(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`))) {
    return { error: 'date must be YYYY-MM-DD' };
  }
  // Allow one day ahead for timezone differences (server UTC vs user IST)
  if (toDayNumber(date) > toDayNumber(todayIso(now)) + 1) return { error: 'date cannot be in the future' };

  const note = String(input.note || '').trim().slice(0, 120);

  return { value: { type, mode, amount: Math.round(amount * 100) / 100, category, date, note } };
}

/** Cash in hand = cash income + ATM withdrawals − cash spending (all time). */
function cashInHand(txns) {
  return txns.reduce((bal, t) => {
    if (t.mode !== 'cash') return bal;
    if (t.type === 'expense') return bal - t.amount;
    return bal + t.amount; // income or withdrawal
  }, 0);
}

/** Totals for one calendar month (YYYY-MM). */
function monthlySummary(txns, month, budget = null) {
  const inMonth = txns.filter((t) => t.date.startsWith(month));
  const byMode = { cash: { income: 0, expense: 0 }, upi: { income: 0, expense: 0 } };
  const byCategory = {};
  let income = 0;
  let expense = 0;
  let withdrawals = 0;

  for (const t of inMonth) {
    if (t.type === 'income') {
      income += t.amount;
      byMode[t.mode].income += t.amount;
    } else if (t.type === 'expense') {
      expense += t.amount;
      byMode[t.mode].expense += t.amount;
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    } else {
      withdrawals += t.amount;
    }
  }

  const categories = Object.entries(byCategory)
    .map(([category, amount]) => ({ category, amount, share: expense ? amount / expense : 0 }))
    .sort((a, b) => b.amount - a.amount);

  const budgetUsed = budget ? expense / budget : null;
  const budgetStatus = budget == null ? 'none' : budgetUsed >= 1 ? 'over' : budgetUsed >= 0.8 ? 'warning' : 'ok';

  return {
    month,
    income,
    expense,
    saved: income - expense,
    withdrawals,
    byMode,
    cashShareOfSpending: expense ? byMode.cash.expense / expense : 0,
    categories,
    budget,
    budgetUsed,
    budgetStatus,
    txnCount: inMonth.length,
    cashInHand: cashInHand(txns)
  };
}

function stdDev(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance) };
}

/**
 * Financial Health Score (300–900) from the last 90 days of the money diary.
 * Six explainable factors, each scored 0–100, combined with fixed weights.
 */
function financialHealthScore(allTxns, { budget = null, now = new Date() } = {}) {
  const today = toDayNumber(todayIso(now));
  const windowStart = today - (SCORE_WINDOW_DAYS - 1);
  const txns = allTxns.filter((t) => {
    const d = toDayNumber(t.date);
    return d >= windowStart && d <= today + 1;
  });

  const firstDay = txns.length ? Math.min(...txns.map((t) => toDayNumber(t.date))) : today;
  const spanDays = Math.max(1, today - firstDay + 1);

  if (txns.length < MIN_TXNS_FOR_SCORE || spanDays < MIN_DAYS_FOR_SCORE) {
    return {
      status: 'insufficient_data',
      needed: { txns: MIN_TXNS_FOR_SCORE, days: MIN_DAYS_FOR_SCORE },
      have: { txns: txns.length, days: txns.length ? spanDays : 0 }
    };
  }

  const income = txns.filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0);
  const expenses = txns.filter((t) => t.type === 'expense');
  const expense = expenses.reduce((a, t) => a + t.amount, 0);
  const months = spanDays / 30;

  // Weekly buckets for regularity and stability
  const weeks = Math.ceil(spanDays / 7);
  const weeklyIncome = new Array(weeks).fill(0);
  const weeklyExpense = new Array(weeks).fill(0);
  for (const t of txns) {
    const w = Math.min(weeks - 1, Math.max(0, Math.floor((toDayNumber(t.date) - firstDay) / 7)));
    if (t.type === 'income') weeklyIncome[w] += t.amount;
    if (t.type === 'expense' && !FIXED_CATEGORIES.has(t.category)) weeklyExpense[w] += t.amount;
  }

  // 1. Savings rate: −10% → 0, +20% or more → 100
  const savingsRate = income > 0 ? (income - expense) / income : -1;
  const f1 = clamp01((savingsRate + 0.1) / 0.3) * 100;

  // 2. Income regularity: share of weeks with any income
  const f2 = (weeklyIncome.filter((x) => x > 0).length / weeks) * 100;

  // 3. Spending stability: weekly day-to-day spend variation, excluding fixed bills (CV ≤ 0.2 → 100, ≥ 1.0 → 0)
  const { mean, sd } = stdDev(weeklyExpense);
  const cv = mean > 0 ? sd / mean : 1;
  const f3 = mean > 0 ? clamp01((1 - cv) / 0.8) * 100 : 50;

  // 4. Budget discipline: avg monthly spend vs budget (≤ 90% → 100, ≥ 130% → 0)
  const avgMonthlyExpense = expense / months;
  const budgetRatio = budget ? avgMonthlyExpense / budget : null;
  const f4 = budget ? clamp01((1.3 - budgetRatio) / 0.4) * 100 : 50;

  // 5. Essential share: discretionary ≤ 30% → 100, ≥ 70% → 0
  const discretionary = expenses.filter((t) => !ESSENTIAL_CATEGORIES.has(t.category)).reduce((a, t) => a + t.amount, 0);
  const discretionaryShare = expense > 0 ? discretionary / expense : 0;
  const f5 = clamp01((0.7 - discretionaryShare) / 0.4) * 100;

  // 6. Record consistency: share of days with at least one entry (≥ 50% → 100)
  const activeDays = new Set(txns.map((t) => t.date)).size;
  const f6 = clamp01(activeDays / spanDays / 0.5) * 100;

  const factorScores = {
    savingsRate: f1,
    incomeRegularity: f2,
    spendingStability: f3,
    budgetDiscipline: f4,
    essentialShare: f5,
    recordConsistency: f6
  };

  const weighted = Object.entries(FACTOR_WEIGHTS).reduce((acc, [k, w]) => acc + (factorScores[k] * w) / 100, 0);
  const score = round(300 + 6 * weighted);

  const tier = score >= 750 ? 'excellent' : score >= 650 ? 'good' : score >= 550 ? 'fair' : 'building';
  const multiplier = { excellent: 3, good: 2, fair: 1, building: 0 }[tier];
  const monthlySurplus = (income - expense) / months;
  const positiveSurplus = Math.max(0, monthlySurplus);
  const loanLimit = Math.min(LOAN_CAP_INR, Math.floor((positiveSurplus * multiplier) / 500) * 500);

  const factors = Object.entries(FACTOR_WEIGHTS).map(([key, weight]) => ({
    key,
    weight,
    score: round(factorScores[key]),
    points: round((factorScores[key] * weight * 6) / 100) // contribution out of the 600 variable points
  }));

  // Lowest three factors under 60 become improvement tips
  const tips = factors
    .filter((f) => f.score < 60 && !(f.key === 'budgetDiscipline' && !budget))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((f) => f.key);
  if (!budget) tips.unshift('setBudget');

  return {
    status: 'ok',
    score,
    tier,
    factors,
    tips: tips.slice(0, 3),
    metrics: {
      windowDays: spanDays,
      txnCount: txns.length,
      income: round(income),
      expense: round(expense),
      savingsRate: Math.round(savingsRate * 1000) / 10,
      monthlySurplus: round(monthlySurplus),
      discretionarySharePct: Math.round(discretionaryShare * 1000) / 10,
      cashSharePct: expense ? Math.round((expenses.filter((t) => t.mode === 'cash').reduce((a, t) => a + t.amount, 0) / expense) * 1000) / 10 : 0,
      spendVariation: Math.round(cv * 100) / 100,
      activeDays
    },
    eligibility: {
      eligible: loanLimit > 0,
      loanLimit,
      maxMonthlyEmi: round(positiveSurplus * 0.4),
      basis: 'Up to 3× average monthly savings by tier, capped at ₹50,000; EMI ≤ 40% of monthly savings'
    }
  };
}

/** Deterministic 60-day sample diary for a daily-wage earner (for demos). */
function generateSampleDiary(now = new Date()) {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const between = (min, max) => Math.round(min + rand() * (max - min));
  const today = toDayNumber(todayIso(now));
  const txns = [];
  const add = (dayOffset, type, mode, amount, category, note) => {
    const date = new Date((today - dayOffset) * DAY_MS).toISOString().slice(0, 10);
    txns.push({ type, mode, amount, category, date, note });
  };

  for (let d = 59; d >= 0; d--) {
    const dow = new Date((today - d) * DAY_MS).getUTCDay();
    const dom = Number(new Date((today - d) * DAY_MS).toISOString().slice(8, 10));

    if (dow === 6) add(d, 'income', 'cash', between(3300, 3800), 'wages', 'Weekly wages');
    if (dom === 15) add(d, 'income', 'upi', 2000, 'business', 'Tailoring side work');
    if (dom === 1) {
      add(d, 'expense', 'cash', 3000, 'rent', 'Room rent');
      add(d, 'expense', 'upi', 1500, 'family', 'Sent home');
    }
    if (dom === 5) add(d, 'expense', 'upi', between(550, 750), 'bills', 'Electricity bill');
    if (dom === 8) add(d, 'expense', 'upi', 299, 'bills', 'Mobile recharge');
    if (rand() < 0.55) add(d, 'expense', 'cash', between(180, 380), 'groceries', 'Sabzi & ration');
    if (rand() < 0.6) add(d, 'expense', rand() < 0.5 ? 'cash' : 'upi', between(20, 60), 'transport', 'Bus / auto');
    if (rand() < 0.3) add(d, 'expense', 'cash', between(60, 200), 'eating_out', 'Tea & snacks');
    if (rand() < 0.08) add(d, 'expense', 'upi', between(300, 1200), 'shopping', 'Clothes');
    if (rand() < 0.04) add(d, 'expense', 'cash', between(100, 400), 'health', 'Medicine');
    if (d === 20) add(d, 'withdrawal', 'cash', 1000, 'atm', 'ATM withdrawal');
  }
  return { txns, budget: 12000 };
}

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  TYPES,
  MODES,
  FACTOR_WEIGHTS,
  validateTransaction,
  cashInHand,
  monthlySummary,
  financialHealthScore,
  generateSampleDiary,
  todayIso
};
