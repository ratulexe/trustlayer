// tests/aiEnsemble.test.js — Gemini + Grok ensemble, with simulated providers (no real API calls)
const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const { combineOpinions } = require('../src/engines/aiEnsemble');

const rule = (score, verdict = score >= 70 ? 'SCAM' : score >= 30 ? 'CAUTION' : 'SAFE') => ({
  score,
  verdict,
  reasons: ['rule reason'],
  vernacularExplanation: 'rule explanation'
});
const op = (provider, score, extra = {}) => ({
  provider,
  label: provider === 'gemini' ? 'Gemini' : 'Grok',
  model: `${provider}-test`,
  score,
  verdict: score >= 70 ? 'SCAM' : score >= 30 ? 'CAUTION' : 'SAFE',
  reasons: [`${provider} reason`],
  vernacularExplanation: `${provider} explanation`,
  ...extra
});

describe('combineOpinions (ensemble policy)', () => {
  test('no AI opinions → null (caller falls back to rules)', () => {
    assert.strictEqual(combineOpinions(rule(5), []), null);
  });

  test('both agree on scam → AI_ENSEMBLE, agree, averaged score', () => {
    const r = combineOpinions(rule(20), [op('gemini', 90), op('grok', 84)]);
    assert.strictEqual(r.engine, 'AI_ENSEMBLE');
    assert.strictEqual(r.agreement, 'agree');
    assert.strictEqual(r.verdict, 'SCAM');
    assert.ok(r.score >= 87);
  });

  test('both agree it is safe → SAFE', () => {
    const r = combineOpinions(rule(5), [op('gemini', 8), op('grok', 12)]);
    assert.strictEqual(r.verdict, 'SAFE');
    assert.strictEqual(r.agreement, 'agree');
  });

  test('strong disagreement → never SAFE, marked disagree', () => {
    const r = combineOpinions(rule(5), [op('gemini', 5), op('grok', 80)]);
    assert.strictEqual(r.agreement, 'disagree');
    assert.notStrictEqual(r.verdict, 'SAFE');
  });

  test('one model very sure + other supports → SCAM', () => {
    const r = combineOpinions(rule(10), [op('gemini', 92), op('grok', 55)]);
    assert.strictEqual(r.verdict, 'SCAM');
    assert.ok(r.score >= 92);
  });

  test('AI can never lower a rule-engine alarm', () => {
    const r = combineOpinions(rule(75), [op('gemini', 10), op('grok', 15)]);
    assert.ok(r.score >= 75);
    assert.strictEqual(r.verdict, 'SCAM');
  });

  test('single provider → named engine and agreement single', () => {
    assert.strictEqual(combineOpinions(rule(5), [op('grok', 60)]).engine, 'GROK_HYBRID_AI');
    assert.strictEqual(combineOpinions(rule(5), [op('gemini', 60)]).engine, 'GEMINI_HYBRID_AI');
    assert.strictEqual(combineOpinions(rule(5), [op('gemini', 60)]).agreement, 'single');
  });

  test('Hindi/Bengali prefer Gemini explanation when both match the verdict', () => {
    const r = combineOpinions(rule(5), [op('grok', 90), op('gemini', 88)], 'hi');
    assert.strictEqual(r.vernacularExplanation, 'gemini explanation');
  });

  test('opinions list includes rules, gemini and grok scores', () => {
    const r = combineOpinions(rule(40), [op('gemini', 70), op('grok', 66)]);
    assert.deepStrictEqual(r.aiOpinions.map((o) => o.provider), ['rules', 'gemini', 'grok']);
  });
});

describe('evaluateWithGemini with simulated Gemini and Grok', () => {
  const realFetch = global.fetch;
  let calls;
  let geminiReply;
  let grokReply;

  const json = (status, body) => ({ ok: status < 400, status, json: async () => body });
  const answer = (score, verdict) => JSON.stringify({ score, verdict, reasons: ['ai reason'], vernacularExplanation: 'ai says' });

  beforeEach(() => {
    calls = [];
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.XAI_API_KEY = 'xai-test-key';
    process.env.GROK_MODEL = 'grok-test-fast';
    global.fetch = async (url) => {
      calls.push(url.includes('x.ai') ? 'grok' : 'gemini');
      if (url.includes('x.ai')) {
        return grokReply === 429
          ? json(429, { error: 'quota' })
          : json(200, { choices: [{ message: { content: grokReply } }] });
      }
      return geminiReply === 429
        ? json(429, { error: { status: 'RESOURCE_EXHAUSTED', message: 'quota' } })
        : json(200, { candidates: [{ content: { parts: [{ text: geminiReply } ] } }] });
    };
    // Fresh module state (cache / pauses) for every test
    delete require.cache[require.resolve('../src/engines/geminiEngine')];
    delete require.cache[require.resolve('../src/engines/llmProviders')];
  });

  test('uncertain message → both providers asked in parallel, ensemble result', async () => {
    geminiReply = answer(88, 'SCAM');
    grokReply = answer(82, 'SCAM');
    const { evaluateWithGemini } = require('../src/engines/geminiEngine');
    const r = await evaluateWithGemini({ rawInput: 'Hello, please send me the verification code', language: 'en' });
    assert.strictEqual(r.engine, 'AI_ENSEMBLE');
    assert.strictEqual(r.verdict, 'SCAM');
    assert.deepStrictEqual(calls.sort(), ['gemini', 'grok']);
  });

  test('Gemini out of quota → Grok alone still answers', async () => {
    geminiReply = 429;
    grokReply = answer(78, 'SCAM');
    process.env.GEMINI_MODEL = 'only-one-model';
    const { evaluateWithGemini } = require('../src/engines/geminiEngine');
    const r = await evaluateWithGemini({ rawInput: 'Kindly confirm the code we sent', language: 'en' });
    assert.strictEqual(r.engine, 'GROK_HYBRID_AI');
    assert.ok(r.partialFailure.includes('Gemini'));
    delete process.env.GEMINI_MODEL;
  });

  test('both fail → rule engine fallback', async () => {
    geminiReply = 429;
    grokReply = 429;
    process.env.GEMINI_MODEL = 'only-one-model';
    const { evaluateWithGemini } = require('../src/engines/geminiEngine');
    const r = await evaluateWithGemini({ rawInput: 'Something unclear here', language: 'en' });
    assert.strictEqual(r.engine, 'HEURISTIC_FALLBACK');
    delete process.env.GEMINI_MODEL;
  });

  test('clear scam (rules >= 85) → no AI call at all', async () => {
    geminiReply = answer(90, 'SCAM');
    grokReply = answer(90, 'SCAM');
    const { evaluateWithGemini } = require('../src/engines/geminiEngine');
    const r = await evaluateWithGemini({ rawInput: 'Dear consumer electricity disconnected tonight pay powerbill@okaxis', language: 'en' });
    assert.strictEqual(calls.length, 0);
    assert.strictEqual(r.verdict, 'SCAM');
  });

  test('repeated message → cached, no second round of calls', async () => {
    geminiReply = answer(60, 'CAUTION');
    grokReply = answer(55, 'CAUTION');
    const { evaluateWithGemini } = require('../src/engines/geminiEngine');
    await evaluateWithGemini({ rawInput: 'Is this payment request genuine?', language: 'en' });
    const first = calls.length;
    const again = await evaluateWithGemini({ rawInput: 'is this  payment request genuine?', language: 'en' });
    assert.strictEqual(calls.length, first);
    assert.strictEqual(again.aiCached, true);
  });

  test('no keys → rule engine only', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.XAI_API_KEY;
    const { evaluateWithGemini } = require('../src/engines/geminiEngine');
    const r = await evaluateWithGemini({ rawInput: 'hello', language: 'en' });
    assert.strictEqual(r.engine, 'HEURISTIC_RULE_ENGINE');
    assert.strictEqual(calls.length, 0);
  });

  test('restore fetch', () => {
    global.fetch = realFetch;
    delete process.env.XAI_API_KEY;
    delete process.env.GROK_MODEL;
    delete process.env.GEMINI_API_KEY;
  });
});
