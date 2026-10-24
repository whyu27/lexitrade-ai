import type { Sentiment, RegulatoryRisk, Analysis } from "../schemas";

export interface RegulatoryAnalysisOutput {
  sentiment: Sentiment;
  regulatoryRisk: RegulatoryRisk;
  summary: string;
  uncertaintyNotes: string[];
  affectedAssets: string[];
  jurisdiction?: string;
  sourceType: "HEURISTIC_RULE_ENGINE" | "LLM_STRUCTURED";
}

const ASSET_PATTERNS: Array<{ pattern: RegExp; symbol: string }> = [
  { pattern: /\b(btc|bitcoin)\b/i, symbol: "BTC" },
  { pattern: /\b(eth|ethereum|ether)\b/i, symbol: "ETH" },
  { pattern: /\b(sol|solana)\b/i, symbol: "SOL" },
  { pattern: /\b(xrp|ripple)\b/i, symbol: "XRP" },
  { pattern: /\b(doge|dogecoin)\b/i, symbol: "DOGE" },
  { pattern: /\b(ada|cardano)\b/i, symbol: "ADA" },
  { pattern: /\b(bnb|binance\s*coin)\b/i, symbol: "BNB" },
];

const JURISDICTION_PATTERNS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\b(sec|cftc|doj|fincen|united\s*states|u\.s\.|usa|congress)\b/i, name: "US" },
  { pattern: /\b(mica|esma|european\s*union|eu)\b/i, name: "EU" },
  { pattern: /\b(fca|united\s*kingdom|uk|bank\s*of\s*england)\b/i, name: "UK" },
  { pattern: /\b(mas|monetary\s*authority\s*of\s*singapore|singapore)\b/i, name: "Singapore" },
  { pattern: /\b(fsa|japan)\b/i, name: "Japan" },
  { pattern: /\b(sfc|hong\s*kong)\b/i, name: "Hong Kong" },
];

export class RegulatoryAnalyzer {
  private aiProvider: string;
  private geminiKey?: string;
  private openAiKey?: string;

  constructor() {
    this.aiProvider = process.env.AI_PROVIDER || "mock";
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openAiKey = process.env.OPENAI_API_KEY;
  }

  async analyze(claim: string, extractedSourceText?: string): Promise<RegulatoryAnalysisOutput> {
    // If an LLM key is configured and mode is not mock, we can call the LLM
    if (this.aiProvider === "gemini" && this.geminiKey) {
      try {
        return await this.callGemini(claim, extractedSourceText);
      } catch (err) {
        console.warn("Gemini analysis failed, falling back to deterministic heuristic engine:", err);
      }
    } else if (this.aiProvider === "openai" && this.openAiKey) {
      try {
        return await this.callOpenAI(claim, extractedSourceText);
      } catch (err) {
        console.warn("OpenAI analysis failed, falling back to deterministic heuristic engine:", err);
      }
    }

    return this.analyzeDeterministic(claim, extractedSourceText);
  }

  analyzeDeterministic(claim: string, extractedSourceText?: string): RegulatoryAnalysisOutput {
    const combined = `${claim} ${extractedSourceText || ""}`.toLowerCase();

    // 1. Identify Assets
    const affectedAssets: string[] = [];
    for (const { pattern, symbol } of ASSET_PATTERNS) {
      if (pattern.test(combined)) {
        affectedAssets.push(symbol);
      }
    }
    // Default to BTC if no specific asset is explicitly mentioned
    if (affectedAssets.length === 0) {
      affectedAssets.push("BTC");
    }

    // 2. Identify Jurisdiction
    let jurisdiction: string | undefined;
    for (const { pattern, name } of JURISDICTION_PATTERNS) {
      if (pattern.test(combined)) {
        jurisdiction = name;
        break;
      }
    }

    // 3. Evaluate Sentiment & Risk
    const isBullish = /\b(approv(ed|al|es)?|grant(ed|s)?|wins?|won|dismiss(ed|al)?|cleared|inflow|greenlight|etf\s*approval|legal\s*clarity)\b/i.test(claim);
    const isBearish = /\b(ban(s|ned)?|lawsuit|sue(s|d)?|charges?|fraud|crackdown|subpoena|penalty|fine|prohibit|enforcement)\b/i.test(claim);
    const isUncertain = /\b(delay(ed|s)?|review(ed|ing)?|investigat(e|ion|ing)|proposal|hearing|appeal(ed|s)?|rumor|preliminary)\b/i.test(claim);

    let sentiment: Sentiment = "NEUTRAL";
    let regulatoryRisk: RegulatoryRisk = "LOW";
    const uncertaintyNotes: string[] = [];

    if (isUncertain) {
      sentiment = "UNCERTAIN";
      regulatoryRisk = "MEDIUM";
      uncertaintyNotes.push("Regulatory action is preliminary, delayed, or under ongoing procedural review.");
    } else if (isBullish && !isBearish) {
      sentiment = "BULLISH";
      regulatoryRisk = "LOW";
    } else if (isBearish && !isBullish) {
      sentiment = "BEARISH";
      regulatoryRisk = "HIGH";
      uncertaintyNotes.push("Potential enforcement action or restrictive legal liability identified.");
    } else if (isBullish && isBearish) {
      sentiment = "UNCERTAIN";
      regulatoryRisk = "MEDIUM";
      uncertaintyNotes.push("Conflicting positive and punitive indicators detected in regulatory language.");
    } else {
      sentiment = "NEUTRAL";
      regulatoryRisk = "LOW";
      uncertaintyNotes.push("Informational regulatory announcement without immediate directional catalyst.");
    }

    if (claim.length < 25) {
      uncertaintyNotes.push("Claim description is very brief; nuances may be omitted.");
    }

    const summary = `Regulatory assessment for [${affectedAssets.join(", ")}] in [${jurisdiction || "Global"}]: Sentiment classified as ${sentiment} with ${regulatoryRisk} regulatory risk level.`;

    return {
      sentiment,
      regulatoryRisk,
      summary,
      uncertaintyNotes,
      affectedAssets,
      jurisdiction,
      sourceType: "HEURISTIC_RULE_ENGINE",
    };
  }

  private async callGemini(claim: string, sourceText?: string): Promise<RegulatoryAnalysisOutput> {
    const prompt = `You are a compliance and regulatory market analyst for crypto assets.
Analyze the following regulatory news claim and optional source text:

Claim: "${claim}"
Source Excerpt: "${sourceText ? sourceText.slice(0, 1500) : "N/A"}"

Return a valid JSON object matching this exact schema:
{
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL" | "UNCERTAIN",
  "regulatoryRisk": "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN",
  "summary": "1-2 sentence concise executive regulatory summary",
  "uncertaintyNotes": ["List of material caveats or pending legal steps"],
  "affectedAssets": ["BTC", "ETH", "SOL", etc.],
  "jurisdiction": "US" | "EU" | "UK" | "Singapore" | "Global"
}`;

    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.geminiKey || "",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);

    // Normalize sentiment
    const rawSentiment = String(parsed.sentiment || "NEUTRAL").toUpperCase();
    const sentiment: Sentiment = ["BULLISH", "BEARISH", "NEUTRAL", "UNCERTAIN"].includes(rawSentiment)
      ? (rawSentiment as Sentiment)
      : "NEUTRAL";

    // Normalize risk
    const rawRisk = String(parsed.regulatoryRisk || "LOW").toUpperCase();
    const regulatoryRisk: RegulatoryRisk = ["LOW", "MEDIUM", "HIGH", "UNKNOWN"].includes(rawRisk)
      ? (rawRisk as RegulatoryRisk)
      : "LOW";

    return {
      sentiment,
      regulatoryRisk,
      summary: parsed.summary || "Regulatory analysis synthesized by Gemini model.",
      uncertaintyNotes: Array.isArray(parsed.uncertaintyNotes) ? parsed.uncertaintyNotes : [],
      affectedAssets: Array.isArray(parsed.affectedAssets) && parsed.affectedAssets.length > 0 ? parsed.affectedAssets : ["BTC"],
      jurisdiction: parsed.jurisdiction || "Global",
      sourceType: "LLM_STRUCTURED",
    };
  }

  private async callOpenAI(claim: string, sourceText?: string): Promise<RegulatoryAnalysisOutput> {
    const prompt = `Analyze this crypto regulatory news claim: "${claim}". Source text: "${sourceText ? sourceText.slice(0, 1500) : "N/A"}".
Return JSON with { "sentiment": "BULLISH"|"BEARISH"|"NEUTRAL"|"UNCERTAIN", "regulatoryRisk": "LOW"|"MEDIUM"|"HIGH"|"UNKNOWN", "summary": string, "uncertaintyNotes": string[], "affectedAssets": string[], "jurisdiction": string }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.openAiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      sentiment: parsed.sentiment,
      regulatoryRisk: parsed.regulatoryRisk,
      summary: parsed.summary,
      uncertaintyNotes: Array.isArray(parsed.uncertaintyNotes) ? parsed.uncertaintyNotes : [],
      affectedAssets: Array.isArray(parsed.affectedAssets) ? parsed.affectedAssets : ["BTC"],
      jurisdiction: parsed.jurisdiction,
      sourceType: "LLM_STRUCTURED",
    };
  }
}

let defaultAnalyzer: RegulatoryAnalyzer | null = null;
export function getRegulatoryAnalyzer(): RegulatoryAnalyzer {
  if (!defaultAnalyzer) {
    defaultAnalyzer = new RegulatoryAnalyzer();
  }
  return defaultAnalyzer;
}
