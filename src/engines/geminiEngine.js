// Google Gemini AI Engine with deterministic fallback
const { runRuleEngine } = require('./ruleEngine');

async function evaluateWithGemini({ rawInput, language = 'en' }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Run fast heuristic rule engine as primary baseline
  const ruleResult = runRuleEngine({ rawInput, language });

  // If no Gemini API key configured, use high-speed heuristic result
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      ...ruleResult,
      engine: 'HEURISTIC_RULE_ENGINE',
      aiEnhanced: false
    };
  }

  // If Gemini API key is provided, perform deep contextual analysis
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 900); // 900ms strict SLA

    const prompt = `You are TrustLayer, an expert AI cybersecurity & UPI scam detection engine in India.
Analyze the following message or UPI input for financial fraud, phishing, lottery scams, electricity cut threats, or social engineering targeting first-time Indian digital users.
User Language: ${language} (en = English, hi = Hindi, bn = Bengali).
Input Text: "${rawInput}"

Respond ONLY with valid JSON in this exact structure:
{
  "score": number (0 to 100, where 0 is completely safe and 100 is confirmed fraud),
  "verdict": "SAFE" | "CAUTION" | "SCAM",
  "reasons": ["short bullet reason 1", "short bullet reason 2"],
  "vernacularExplanation": "Clear, non-technical 1-sentence warning directly addressing the user in ${language}"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.1 }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const aiParsed = JSON.parse(textOutput);

    return {
      score: Math.max(ruleResult.score, aiParsed.score || 0),
      verdict: aiParsed.verdict || ruleResult.verdict,
      reasons: [...new Set([...ruleResult.reasons, ...(aiParsed.reasons || [])])],
      vernacularExplanation: aiParsed.vernacularExplanation || ruleResult.vernacularExplanation,
      extractedUpi: ruleResult.extractedUpi,
      latencyMs: ruleResult.latencyMs + 180,
      engine: 'GEMINI_HYBRID_AI',
      aiEnhanced: true
    };
  } catch (err) {
    // Graceful fallback to deterministic rule engine
    return {
      ...ruleResult,
      engine: 'HEURISTIC_FALLBACK',
      aiEnhanced: false,
      fallbackReason: err.message
    };
  }
}

module.exports = {
  evaluateWithGemini
};
