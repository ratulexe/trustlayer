// Combines the rule engine with one or more AI opinions (Gemini, Grok) into one verdict.
// Pure function — no I/O — so the policy is easy to test and explain to judges.

const STRONG_SCAM = 85; // one model is very sure it's a scam…
const SUPPORT = 50; // …and the other at least half agrees → SCAM
const DISAGREE_SPREAD = 40; // models this far apart → at least CAUTION
const AGREE_SPREAD = 25;

const verdictFor = (score) => (score >= 70 ? 'SCAM' : score >= 30 ? 'CAUTION' : 'SAFE');

/**
 * @param ruleResult  output of runRuleEngine()
 * @param opinions    successful AI answers: [{ provider, label, model, score, verdict, reasons, vernacularExplanation }]
 * @param language    'en' | 'hi' | 'bn'
 * @returns combined result, or null when there are no AI opinions
 */
function combineOpinions(ruleResult, opinions, language = 'en') {
  if (!opinions || opinions.length === 0) return null;

  const scores = opinions.map((o) => o.score);
  const aiScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const spread = Math.max(...scores) - Math.min(...scores);
  const multiple = opinions.length >= 2;

  // 1. AI can raise the risk but never lower a rule-engine alarm
  let finalScore = Math.max(ruleResult.score, aiScore);

  // 2. One model very sure + the other supports it → trust the stronger signal
  if (multiple && Math.max(...scores) >= STRONG_SCAM && Math.min(...scores) >= SUPPORT) {
    finalScore = Math.max(finalScore, Math.max(...scores));
  }

  // 3. Models strongly disagree → never call it safe
  let agreement = 'single';
  if (multiple) {
    if (spread > DISAGREE_SPREAD) {
      agreement = 'disagree';
      finalScore = Math.max(finalScore, 35);
    } else if (spread <= AGREE_SPREAD && new Set(opinions.map((o) => verdictFor(o.score))).size === 1) {
      agreement = 'agree';
    } else {
      agreement = 'partial';
    }
  }

  const verdict = verdictFor(finalScore);

  // Explanation from a model that matches the final verdict; prefer Gemini for Hindi/Bengali
  const ordered = [...opinions].sort((a, b) => {
    const pref = (o) => (language !== 'en' && o.provider === 'gemini' ? 0 : 1);
    return pref(a) - pref(b);
  });
  const matching = ordered.find((o) => o.verdict === verdict && o.vernacularExplanation);
  const vernacularExplanation =
    (matching && matching.vernacularExplanation) ||
    (ruleResult.verdict === verdict ? ruleResult.vernacularExplanation : '') ||
    ordered.find((o) => o.vernacularExplanation)?.vernacularExplanation ||
    ruleResult.vernacularExplanation;

  // Rule reasons first, then up to 2 per model, de-duplicated, max 6
  const reasons = [...new Set([...ruleResult.reasons, ...opinions.flatMap((o) => (o.reasons || []).slice(0, 2))])].slice(0, 6);

  const engine = multiple ? 'AI_ENSEMBLE' : opinions[0].provider === 'grok' ? 'GROK_HYBRID_AI' : 'GEMINI_HYBRID_AI';

  return {
    score: finalScore,
    verdict,
    reasons,
    vernacularExplanation,
    engine,
    aiEnhanced: true,
    agreement,
    aiOpinions: [
      { provider: 'rules', label: 'Rules', score: ruleResult.score, verdict: ruleResult.verdict },
      ...opinions.map((o) => ({ provider: o.provider, label: o.label, model: o.model, score: o.score, verdict: verdictFor(o.score) }))
    ]
  };
}

module.exports = { combineOpinions, verdictFor };
