import {
  saveAnalysis,
  saveEvidence,
  saveDecision,
  savePaperTrade,
  getDb,
  initDb,
} from "./client";
import type { Analysis, Evidence, Decision, PaperTrade } from "../schemas";

export async function seedInitialDemoData(force = false): Promise<{ seeded: boolean; count: number }> {
  await initDb();
  const db = getDb();

  if (!force) {
    const existing = await db.execute("SELECT count(*) as cnt FROM analyses");
    const count = Number(existing.rows[0]?.cnt || 0);
    if (count > 0) {
      return { seeded: false, count };
    }
  }

  const now = new Date();
  const t1 = new Date(now.getTime() - 1000 * 60 * 45).toISOString(); // 45 mins ago
  const t2 = new Date(now.getTime() - 1000 * 60 * 25).toISOString(); // 25 mins ago
  const t3 = new Date(now.getTime() - 1000 * 60 * 10).toISOString(); // 10 mins ago

  // ----------------------------------------------------
  // Scenario 1: Spot Bitcoin ETF Approval (BUY / PASS)
  // ----------------------------------------------------
  const a1: Analysis = {
    id: "an-seed-001-sec-btc-etf",
    claim: "Securities and Exchange Commission grants formal regulatory approval for Bitcoin spot ETF listing and trading across US national exchanges.",
    sourceUrl: "https://www.sec.gov/news/press-release",
    createdAt: t1,
    verificationStatus: "VERIFIED",
    sentiment: "BULLISH",
    regulatoryRisk: "LOW",
    summary: "The SEC has granted formal regulatory approval for spot Bitcoin exchange-traded funds to list and trade on US national securities exchanges, establishing legal institutional clarity.",
    uncertaintyNotes: [
      "Standard ongoing regulatory reporting and disclosure rules apply to sponsors.",
    ],
    affectedAssets: ["BTC"],
    jurisdiction: "US",
    sourceType: "LLM_STRUCTURED",
  };

  const e1_news: Evidence = {
    id: "ev-seed-001-news",
    analysisId: a1.id,
    type: "NEWS_SOURCE",
    provider: "SEC Regulatory Archive",
    sourceUrl: "https://www.sec.gov/news/press-release",
    observedAt: t1,
    retrievedAt: t1,
    payload: {
      status: "VERIFIED",
      matchedKeywords: ["sec", "approval", "bitcoin", "spot", "etf", "exchanges"],
      confidenceScore: 0.96,
      reason: "Official regulatory order archived in SEC press releases index.",
    },
  };

  const e1_market: Evidence = {
    id: "ev-seed-001-market",
    analysisId: a1.id,
    type: "MARKET_OBSERVATION",
    provider: "Binance Spot",
    observedAt: t1,
    retrievedAt: t1,
    payload: {
      asset: "BTC",
      price: 67850.25,
      isFresh: true,
      ageSeconds: 12,
      priceChangePercent24h: 3.45,
      volume24h: 42150.8,
    },
  };

  const d1: Decision = {
    id: "dec-seed-001-buy",
    analysisId: a1.id,
    strategyVersion: "1.0.0",
    outcome: "BUY",
    evaluatedAt: t1,
    evidenceIds: [e1_news.id, e1_market.id],
    ruleResults: [
      { ruleId: "RULE_VERIFIED_NEWS", passed: true, explanation: "Source verified with official government filing (confidence 0.96)." },
      { ruleId: "RULE_SENTIMENT_COMPLIANT", passed: true, explanation: "Sentiment classified as BULLISH with LOW regulatory risk." },
      { ruleId: "RULE_ASSET_MATCH", passed: true, explanation: "Primary target asset BTC matched in regulatory text." },
      { ruleId: "RULE_MARKET_FRESHNESS", passed: true, explanation: "Binance Spot ticker retrieved 12s ago (< 300s limit)." },
      { ruleId: "RULE_VOLATILITY_GUARD", passed: true, explanation: "24h price volatility at +3.45% (< 20.00% anomaly boundary)." },
      { ruleId: "RULE_RISK_LIMITS", passed: true, explanation: "Virtual position size calculated at exactly 5.00% of portfolio ($5,000)." },
    ],
    rejectionReasons: [],
  };

  const pt1: PaperTrade = {
    id: "pt-seed-001-btc-long",
    decisionId: d1.id,
    asset: "BTC",
    direction: "LONG",
    entryPrice: 67850.25,
    positionSize: 0.073692, // $5,000 USD allocation (~0.0737 BTC)
    stopLoss: 65814.74, // -3%
    takeProfit: 71921.27, // +6%
    openedAt: t1,
    status: "OPEN",
  };

  // ----------------------------------------------------
  // Scenario 2: Unverified Social Media Rumor (REJECT / NO_TRADE)
  // ----------------------------------------------------
  const a2: Analysis = {
    id: "an-seed-002-sol-rumor",
    claim: "Unconfirmed rumors allege the Federal Reserve will adopt Solana blockchain for real-time interbank settlement rails next quarter.",
    sourceUrl: undefined,
    createdAt: t2,
    verificationStatus: "UNVERIFIED",
    sentiment: "UNCERTAIN",
    regulatoryRisk: "MEDIUM",
    summary: "Unsubstantiated rumor circulating on social channels alleging central bank adoption of public Solana ledger rails; lacking official docket citation.",
    uncertaintyNotes: [
      "No official Federal Reserve Board docket or press release exists corroborating this claim.",
      "High probability of speculative market manipulation.",
    ],
    affectedAssets: ["SOL"],
    jurisdiction: "US",
    sourceType: "HEURISTIC_RULE_ENGINE",
  };

  const e2_news: Evidence = {
    id: "ev-seed-002-news",
    analysisId: a2.id,
    type: "NEWS_SOURCE",
    provider: "NewsVerifier",
    observedAt: t2,
    retrievedAt: t2,
    payload: {
      status: "UNVERIFIED",
      matchedKeywords: [],
      confidenceScore: 0.0,
      reason: "No independent source URL provided; unverified claim rejected by compliance policy.",
    },
  };

  const d2: Decision = {
    id: "dec-seed-002-reject",
    analysisId: a2.id,
    strategyVersion: "1.0.0",
    outcome: "NO_TRADE",
    evaluatedAt: t2,
    evidenceIds: [e2_news.id],
    ruleResults: [
      { ruleId: "RULE_VERIFIED_NEWS", passed: false, explanation: "Claim verification status is UNVERIFIED; mandatory primary source proof required." },
      { ruleId: "RULE_SENTIMENT_COMPLIANT", passed: false, explanation: "Sentiment classified as UNCERTAIN; bullish verification required." },
      { ruleId: "RULE_ASSET_MATCH", passed: true, explanation: "Target asset SOL identified in text." },
      { ruleId: "RULE_MARKET_FRESHNESS", passed: true, explanation: "Market data checked." },
      { ruleId: "RULE_VOLATILITY_GUARD", passed: true, explanation: "Volatility within bounds." },
      { ruleId: "RULE_RISK_LIMITS", passed: false, explanation: "Execution aborted due to preceding rule failures." },
    ],
    rejectionReasons: [
      "Claim verification status is UNVERIFIED; deterministic policy requires verified primary source proof.",
      "Sentiment classified as UNCERTAIN; bullish verification required.",
    ],
  };

  // ----------------------------------------------------
  // Scenario 3: Contradictory Denial / Lawsuit Conflict (REJECT / NO_TRADE)
  // ----------------------------------------------------
  const a3: Analysis = {
    id: "an-seed-003-eth-lawsuit-conflict",
    claim: "SEC officially dismisses and drops all enforcement lawsuit charges against Ethereum foundation.",
    sourceUrl: "https://example.com/sec-lawsuit-active",
    createdAt: t3,
    verificationStatus: "CONFLICTING",
    sentiment: "BEARISH",
    regulatoryRisk: "HIGH",
    summary: "Claim alleges dismissal of enforcement action, but independent source text explicitly verifies ongoing active litigation and contested claims.",
    uncertaintyNotes: [
      "Direct semantic contradiction between news claim and judicial case docket.",
      "High legal enforcement risk identified.",
    ],
    affectedAssets: ["ETH"],
    jurisdiction: "US",
    sourceType: "HEURISTIC_RULE_ENGINE",
  };

  const e3_news: Evidence = {
    id: "ev-seed-003-news",
    analysisId: a3.id,
    type: "NEWS_SOURCE",
    provider: "Legal Court Docket",
    sourceUrl: "https://example.com/sec-lawsuit-active",
    observedAt: t3,
    retrievedAt: t3,
    payload: {
      status: "CONFLICTING",
      matchedKeywords: ["sec", "charges", "lawsuit", "denied", "active"],
      conflictingTerms: ["denied", "rejected", "contested", "ongoing"],
      confidenceScore: 0.15,
      reason: "Primary source text directly contradicts dismissal claim.",
    },
  };

  const d3: Decision = {
    id: "dec-seed-003-conflict",
    analysisId: a3.id,
    strategyVersion: "1.0.0",
    outcome: "NO_TRADE",
    evaluatedAt: t3,
    evidenceIds: [e3_news.id],
    ruleResults: [
      { ruleId: "RULE_VERIFIED_NEWS", passed: false, explanation: "Verification status is CONFLICTING; independent source text contradicts claim." },
      { ruleId: "RULE_SENTIMENT_COMPLIANT", passed: false, explanation: "Sentiment classified as BEARISH with HIGH regulatory risk." },
      { ruleId: "RULE_ASSET_MATCH", passed: true, explanation: "Target asset ETH verified." },
      { ruleId: "RULE_MARKET_FRESHNESS", passed: true, explanation: "Market data checked." },
      { ruleId: "RULE_VOLATILITY_GUARD", passed: true, explanation: "Volatility within bounds." },
      { ruleId: "RULE_RISK_LIMITS", passed: false, explanation: "Execution aborted due to preceding rule failures." },
    ],
    rejectionReasons: [
      "Verification status is CONFLICTING; independent source text contradicts claim.",
      "Sentiment classified as BEARISH with HIGH regulatory risk.",
    ],
  };

  // Save in chronological sequence to maintain cryptographic hash chain
  await saveAnalysis(a1);
  await saveEvidence(e1_news);
  await saveEvidence(e1_market);
  await saveDecision(d1);
  await savePaperTrade(pt1);

  await saveAnalysis(a2);
  await saveEvidence(e2_news);
  await saveDecision(d2);

  await saveAnalysis(a3);
  await saveEvidence(e3_news);
  await saveDecision(d3);

  return { seeded: true, count: 3 };
}
