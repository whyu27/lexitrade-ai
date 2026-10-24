import { describe, it, expect, beforeAll } from "vitest";
import {
  initDb,
  saveAnalysis,
  saveEvidence,
  saveDecision,
  savePaperTrade,
  getAnalysisById,
  getAnalyses,
  getPaperTrades,
  verifyAuditLedgerIntegrity,
} from "../src/lib/db/client";
import { seedInitialDemoData } from "../src/lib/db/seed";
import type { Analysis, Evidence, Decision, PaperTrade } from "../src/lib/schemas";

describe("Database & Persistence Layer", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = `file:test-lexitrade-${Date.now()}.db`;
    await initDb();
  });

  it("should initialize database tables and save an analysis", async () => {
    const analysis: Analysis = {
      id: "test-analysis-1",
      claim: "SEC approves first Solana ETF with immediate trading",
      sourceUrl: "https://example.com/sec-release",
      createdAt: new Date().toISOString(),
      verificationStatus: "VERIFIED",
      sentiment: "BULLISH",
      regulatoryRisk: "LOW",
      summary: "Regulatory approval granted for Solana spot ETF",
      uncertaintyNotes: ["Approval effective immediately"],
      affectedAssets: ["SOL"],
      jurisdiction: "US",
    };

    await saveAnalysis(analysis);

    const list = await getAnalyses();
    expect(list.some((a) => a.id === "test-analysis-1")).toBe(true);
  });

  it("should save evidence and decision linked to analysis", async () => {
    const evidence: Evidence = {
      id: "test-evidence-1",
      analysisId: "test-analysis-1",
      type: "MARKET_OBSERVATION",
      provider: "Binance",
      retrievedAt: new Date().toISOString(),
      payload: { price: 180.5, volume: 50000 },
    };

    const decision: Decision = {
      id: "test-decision-1",
      analysisId: "test-analysis-1",
      strategyVersion: "1.0.0",
      outcome: "BUY",
      evaluatedAt: new Date().toISOString(),
      evidenceIds: ["test-evidence-1"],
      ruleResults: [
        { ruleId: "VERIFIED_NEWS", passed: true, explanation: "News is verified" },
        { ruleId: "SENTIMENT_BULLISH", passed: true, explanation: "Sentiment is bullish" },
      ],
      rejectionReasons: [],
    };

    const trade: PaperTrade = {
      id: "test-trade-1",
      decisionId: "test-decision-1",
      asset: "SOL",
      direction: "LONG",
      entryPrice: 180.5,
      positionSize: 10,
      stopLoss: 170.0,
      takeProfit: 200.0,
      openedAt: new Date().toISOString(),
      status: "OPEN",
    };

    await saveEvidence(evidence);
    await saveDecision(decision);
    await savePaperTrade(trade);

    const record = await getAnalysisById("test-analysis-1");
    expect(record.analysis).not.toBeNull();
    expect(record.analysis?.id).toBe("test-analysis-1");
    expect(record.evidences.length).toBeGreaterThan(0);
    expect(record.decision?.outcome).toBe("BUY");
    expect(record.paperTrade?.asset).toBe("SOL");

    const trades = await getPaperTrades();
    expect(trades.some((t) => t.id === "test-trade-1")).toBe(true);
  });

  it("should compute deterministic SHA-256 hash chaining on saved records", async () => {
    const record = await getAnalysisById("test-analysis-1");
    expect(record.analysis?.recordHash).toBeDefined();
    expect(record.analysis?.recordHash?.length).toBe(64); // 64 hex characters for SHA-256
    expect(record.decision?.recordHash).toBeDefined();
    expect(record.decision?.recordHash?.length).toBe(64);
  });

  it("should verify immutable audit ledger integrity successfully", async () => {
    const integrity = await verifyAuditLedgerIntegrity();
    if (!integrity.valid) {
      console.log("INTEGRITY ERROR DETAIL:", integrity.error);
    }
    expect(integrity.valid).toBe(true);
    expect(integrity.totalAnalyses).toBeGreaterThan(0);
  });

  it("should seed realistic demo cases when database is empty", async () => {
    const result = await seedInitialDemoData(true);
    expect(result.seeded).toBe(true);
    expect(result.count).toBe(3);

    const list = await getAnalyses();
    expect(list.some((a) => a.id === "an-seed-001-sec-btc-etf")).toBe(true);
    expect(list.some((a) => a.id === "an-seed-002-sol-rumor")).toBe(true);
    expect(list.some((a) => a.id === "an-seed-003-eth-lawsuit-conflict")).toBe(true);
  });
});
