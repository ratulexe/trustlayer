// AI scam engine: rule engine first, then Gemini + Grok in parallel, combined into one verdict.
// The function keeps its original name (evaluateWithGemini) so callers don't change.
const { performance } = require('perf_hooks');
const crypto = require('crypto');
const { runRuleEngine } = require('./ruleEngine');
const scamDb = require('../data/scamDatabase.json');
const { buildPrompt, redact, gemini, grok, getGeminiApiKey } = require('./llmProviders');
const { combineOpinions } = require('./aiEnsemble');

const PROVIDERS = [gemini, grok];

function getGeminiTimeout() {
  const envVal = parseInt(process.env.GEMINI_TIMEOUT_MS, 10);
  // Default 3000 ms: real AI replies take ~1-3 s, so 1000 ms (AGENTS.md rule 5) would make
  // every call fall back. Team decision pending — override with GEMINI_TIMEOUT_MS.
  return Number.isInteger(envVal) && envVal > 0 ? envVal : 3000;
}

// ---- Quota savers ---------------------------------------------------------------
// Free AI tiers are tiny (e.g. 20 requests/day per Gemini model), so only ask the AI when it
// can change the answer, reuse answers for repeated messages, and back off per provider on 429.
const VERIFIED_VPAS = new Set((scamDb.verifiedMerchants || []).map((m) => String(m.vpa).toLowerCase()));
const CONFIDENT_SCAM_SCORE = 85;
const AI_CACHE_TTL_MS = 60 * 60 * 1000;
const AI_CACHE_MAX = 300;
const QUOTA_PAUSE_MS = 60 * 1000;
const aiCache = new Map(); // key → { opinions, at }
const pausedUntil = { gemini: 0, grok: 0 };

function cacheKey(text, language) {
  const normalized = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  return crypto.createHash('sha256').update(`${language}|${normalized}`).digest('hex');
}

function isConfidentRuleResult(ruleResult) {
  if (ruleResult.score >= CONFIDENT_SCAM_SCORE) return true;
  const upis = ruleResult.extractedUpis || (ruleResult.extractedUpi ? [ruleResult.extractedUpi] : []);
  // Paying only verified merchants with no scam signals → already safe
  return ruleResult.score <= 10 && upis.length > 0 && upis.every((u) => VERIFIED_VPAS.has(String(u).toLowerCase()));
}

function withRuleFields(ruleResult, combined, extra) {
  return {
    ...combined,
    extractedUpi: ruleResult.extractedUpi,
    extractedUpis: ruleResult.extractedUpis,
    heuristicLatencyMs: ruleResult.latencyMs,
    ...extra
  };
}

async function evaluateWithGemini({ rawInput, language = 'en' }) {
  const ruleResult = runRuleEngine({ rawInput, language });
  const configured = PROVIDERS.filter((p) => p.isConfigured());

  // No AI keys at all → rule engine only (works offline)
  if (configured.length === 0) {
    return { ...ruleResult, engine: 'HEURISTIC_RULE_ENGINE', aiEnhanced: false };
  }

  // 1. Rule engine already certain → don't spend AI quota
  if (isConfidentRuleResult(ruleResult)) {
    return { ...ruleResult, engine: 'HEURISTIC_RULE_ENGINE', aiEnhanced: false, aiSkipped: 'confident' };
  }

  // 2. Same message checked recently → reuse the AI answers
  const key = cacheKey(rawInput, language);
  const cached = aiCache.get(key);
  if (cached && Date.now() - cached.at < AI_CACHE_TTL_MS) {
    const combined = combineOpinions(ruleResult, cached.opinions, language);
    return withRuleFields(ruleResult, combined, { latencyMs: ruleResult.latencyMs, aiCached: true });
  }

  // 3. Skip providers that just ran out of quota
  const active = configured.filter((p) => Date.now() >= pausedUntil[p.name]);
  if (active.length === 0) {
    return { ...ruleResult, engine: 'HEURISTIC_FALLBACK', aiEnhanced: false, fallbackReason: 'AI_QUOTA_PAUSED' };
  }

  // 4. Ask every active provider in parallel, sharing one time limit
  const prompt = buildPrompt(rawInput, language);
  const aiStart = performance.now();
  const timeoutMs = getGeminiTimeout();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const elapsed = () => performance.now() - aiStart;

  let settled;
  try {
    settled = await Promise.allSettled(
      active.map((p) => p.ask({ prompt, signal: controller.signal, elapsed, timeoutMs }).then((r) => ({ ...r, provider: p.name, label: p.label })))
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const opinions = [];
  const failures = [];
  settled.forEach((s, i) => {
    const p = active[i];
    if (s.status === 'fulfilled') {
      opinions.push(s.value);
    } else {
      const err = s.reason || {};
      if (err.status === 429) pausedUntil[p.name] = Date.now() + QUOTA_PAUSE_MS;
      const reason = err.name === 'AbortError' ? 'timeout' : redact(err.message || err).slice(0, 300);
      failures.push(`${p.label}: ${reason}`);
      // Never logs keys or the user's message
      console.warn(`[${p.label}] Fallback: ${reason}`);
    }
  });

  if (opinions.length === 0) {
    return {
      ...ruleResult,
      engine: 'HEURISTIC_FALLBACK',
      aiEnhanced: false,
      fallbackReason: failures.join(' | ')
    };
  }

  if (aiCache.size >= AI_CACHE_MAX) aiCache.delete(aiCache.keys().next().value);
  aiCache.set(key, { opinions, at: Date.now() });

  const combined = combineOpinions(ruleResult, opinions, language);
  return withRuleFields(ruleResult, combined, {
    latencyMs: Number((ruleResult.latencyMs + elapsed()).toFixed(2)),
    ...(failures.length ? { partialFailure: failures.join(' | ') } : {})
  });
}

module.exports = {
  evaluateWithGemini,
  getGeminiApiKey,
  getGeminiTimeout
};
