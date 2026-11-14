// Google Gemini AI Engine with deterministic fallback
const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');
const { runRuleEngine } = require('./ruleEngine');

function getGeminiApiKey() {
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  ) {
    return process.env.GEMINI_API_KEY;
  }

  // Load from .env if present in root
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/^\s*GEMINI_API_KEY\s*=\s*(.+)$/m);
      if (match) {
        let key = match[1].trim();
        if (
          (key.startsWith('"') && key.endsWith('"')) ||
          (key.startsWith("'") && key.endsWith("'"))
        ) {
          key = key.slice(1, -1);
        }
        if (key && key !== 'your_gemini_api_key_here') {
          process.env.GEMINI_API_KEY = key;
          return key;
        }
      }
    }
  } catch (_) {}

  return null;
}

async function evaluateWithGemini({ rawInput, language = 'en' }) {
  const apiKey = getGeminiApiKey();

  // Run fast heuristic rule engine as primary baseline (<20ms SLA)
  const ruleResult = runRuleEngine({ rawInput, language });

  // If no Gemini API key configured, use high-speed heuristic result
  if (!apiKey) {
    return {
      ...ruleResult,
      heuristicLatencyMs: ruleResult.latencyMs,
      latencyMs: ruleResult.latencyMs,
      engine: 'HEURISTIC_RULE_ENGINE',
      aiEnhanced: false
    };
  }

  // If Gemini API key is provided, perform deep contextual analysis
  const aiStart = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000); // Strict 3000ms SLA for live network calls

  try {
    const prompt = `You are TrustLayer, an expert AI cybersecurity & UPI scam detection engine designed for digital payment safety in India.
Analyze the following message, UPI handle, or payment request for financial fraud, phishing, and social engineering targeting Indian consumers.

SPECIFIC SCAM VECTORS TO DETECT:
1. TRAI / Telecom SIM Deactivation Scam (threats of SIM block/suspension, asking for KYC verification fee via UPI).
2. Telegram Part-Time Job & Prepaid Task Scam (liking YouTube videos, rating hotels, paying deposit/advance money to "unlock" bonus or salary).
3. Fake Courier / India Post / Customs Parcel Duty Scam (unpaid parcel fee, illegal parcel detained, redelivery charge).
4. Electricity Disconnection Ultimatum (tonight power cut threats by discoms like WBSEDCL/CESC/TPDDL, paying officer via personal UPI).
5. Fake Bank KYC Expiry Alert (YONO, PAN update, account freeze threats).
6. Reverse UPI PIN Collect Trap (asking user to scan QR or enter UPI PIN to receive prize/refund/lottery).
7. Disguised Hinglish / Banglish Coercion, Sarcasm & Reverse Psychology:
   - Phrases like "No hurry bro, just send ₹2000 first to unlock your ₹50k job bonus"
   - "Arey tension mat lo bhai, bas ₹500 verification fee bhej do"
   - "Kono chap nei dada, 1000 taka advance pathiye 30k commission tule nin"
   - Casual or sarcastic language pretending to be helpful while demanding upfront funds to unlock money or rewards.

User Preferred Language: ${language} (en = English, hi = Hindi, bn = Bengali).
Input Text: "${rawInput}"

Respond ONLY with valid JSON in this exact structure:
{
  "score": number, // 0 to 100 (where 0 is completely safe and 100 is confirmed fraud)
  "verdict": "SAFE" | "CAUTION" | "SCAM",
  "reasons": ["short bullet reason 1", "short bullet reason 2"],
  "vernacularExplanation": "Clear, non-technical 1-sentence warning directly addressing the user in ${language}"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        }),
        signal: controller.signal
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const aiParsed = JSON.parse(textOutput);

    // Compute finalScore strictly from Math.max(ruleResult.score, aiParsed.score)
    const aiScore = Number(aiParsed.score) || 0;
    const finalScore = Math.max(ruleResult.score, aiScore);
    const finalVerdict =
      finalScore >= 70 ? 'SCAM' : finalScore >= 30 ? 'CAUTION' : 'SAFE';

    const totalLatencyMs = Number(
      (ruleResult.latencyMs + (performance.now() - aiStart)).toFixed(2)
    );

    return {
      score: finalScore,
      verdict: finalVerdict,
      reasons: [...new Set([...ruleResult.reasons, ...(aiParsed.reasons || [])])],
      vernacularExplanation:
        aiParsed.vernacularExplanation || ruleResult.vernacularExplanation,
      extractedUpi: ruleResult.extractedUpi,
      heuristicLatencyMs: ruleResult.latencyMs,
      latencyMs: totalLatencyMs,
      engine: 'GEMINI_HYBRID_AI',
      aiEnhanced: true
    };
  } catch (err) {
    // Deterministic fallback to rule engine
    return {
      ...ruleResult,
      heuristicLatencyMs: ruleResult.latencyMs,
      latencyMs: ruleResult.latencyMs,
      engine: 'HEURISTIC_FALLBACK',
      aiEnhanced: false,
      fallbackReason: err.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  evaluateWithGemini,
  getGeminiApiKey
};
