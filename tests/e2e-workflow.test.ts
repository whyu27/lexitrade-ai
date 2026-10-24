import { describe, it, expect, vi, beforeAll } from "vitest";
import { NewsVerifier } from "../src/lib/verification/news-verifier";
import { RegulatoryAnalyzer } from "../src/lib/analysis/regulatory-analyzer";
import { MarketDataService } from "../src/lib/market";
import { DecisionEngine } from "../src/lib/engine/decision-engine";
import { PaperTradingEngine } from "../src/lib/paper-trading/paper-trading-engine";
import {
  initDb,
  saveAnalysis,
  saveEvidence,
  saveDecision,
  savePaperTrade,
  getAnalysisById,
} from "../src/lib/db/client";
import type { Analysis, Evidence, MarketObservation } from "../src/lib/schemas";

describe("Phase 8 — End-to-End Autonomous Pipeline & Hardening", () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = "file:test-e2e.db";
    await initDb();
  });

  it("E2E Scenario 1 (BUY): Verified news + Bullish sentiment + Fresh market -> creates Paper Trade", async () => {
    const claim = "SEC formally grants regulatory approval for Bitcoin spot ETF listing";
    const sourceUrl = "https://example.com/sec-etf-approved";
    const analysisId = `e2e-an-buy-${Date.now()}`;

    // 1. Verify news
    const verifier = new NewsVerifier();
    const mockHtml = `
      <html>
        <head><title>SEC Grants Regulatory Approval for Bitcoin Spot ETF</title></head>
        <body><article><p>The SEC has granted formal regulatory approval for Bitcoin spot ETF listing and trading.</p></article></body>
      </html>
    `;
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "text/html" }),
      text: async () => mockHtml,
    } as unknown as Response);

    const verificationResult = await verifier.verifyClaim(claim, sourceUrl);
    expect(verificationResult.status).toBe("VERIFIED");
    const newsEvidence = verifier.createNewsEvidence(analysisId, verificationResult);

    // 2. Regulatory Analysis
    const analyzer = new RegulatoryAnalyzer();
    const analysisOutput = await analyzer.analyze(claim, verificationResult.extractedExcerpt);
    expect(analysisOutput.sentiment).toBe("BULLISH");
    expect(analysisOutput.regulatoryRisk).toBe("LOW");

    // 3. Market Evidence
    const mockObservation: MarketObservation = {
      asset: "BTC",
      price: 80500,
      observedAt: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
      provider: "Binance Spot",
      metrics: { priceChangePercent: 2.1, volume: 15000 },
    };
    const marketService = new MarketDataService();
    const marketEvidence = marketService.createMarketEvidence(analysisId, mockObservation);

    // 4. Analysis Record
    const analysisRecord: Analysis = {
      id: analysisId,
      claim,
      sourceUrl,
      createdAt: new Date().toISOString(),
      verificationStatus: verificationResult.status,
      sentiment: analysisOutput.sentiment,
      regulatoryRisk: analysisOutput.regulatoryRisk,
      summary: analysisOutput.summary,
      uncertaintyNotes: analysisOutput.uncertaintyNotes,
      affectedAssets: analysisOutput.affectedAssets,
      jurisdiction: analysisOutput.jurisdiction,
    };

    // 5. Evaluate Decision
    const engine = new DecisionEngine();
    const engineResult = engine.evaluate(
      analysisRecord,
      [newsEvidence, marketEvidence],
      mockObservation
    );

    expect(engineResult.decision.outcome).toBe("BUY");
    expect(engineResult.decision.rejectionReasons.length).toBe(0);

    // 6. Paper Trading Execution
    const paperEngine = new PaperTradingEngine();
    const paperTrade = paperEngine.createTradeFromDecision(
      engineResult.decision.id,
      engineResult.proposedTrade!
    );
    expect(paperTrade.status).toBe("OPEN");
    expect(paperTrade.asset).toBe("BTC");

    // 7. Persist to SQLite
    await saveAnalysis(analysisRecord);
    await saveEvidence(newsEvidence);
    await saveEvidence(marketEvidence);
    await saveDecision(engineResult.decision);
    await savePaperTrade(paperTrade);

    // 8. Audit trail retrieval verification
    const auditRecord = await getAnalysisById(analysisId);
    expect(auditRecord.analysis?.id).toBe(analysisId);
    expect(auditRecord.evidences.length).toBe(2);
    expect(auditRecord.decision?.outcome).toBe("BUY");
    expect(auditRecord.paperTrade?.status).toBe("OPEN");
  });

  it("E2E Scenario 2 (NO TRADE): Unverified claim without source -> stops safely at Decision Engine", async () => {
    const claim = "Unconfirmed rumor: Federal Reserve adopting Solana for instant bank settlements";
    const analysisId = `e2e-an-notrade-${Date.now()}`;

    // 1. Verify news without source URL
    const verifier = new NewsVerifier();
    const verificationResult = await verifier.verifyClaim(claim, undefined);
    expect(verificationResult.status).toBe("UNVERIFIED");

    const newsEvidence = verifier.createNewsEvidence(analysisId, verificationResult);

    // 2. Regulatory Analysis
    const analyzer = new RegulatoryAnalyzer();
    const analysisOutput = await analyzer.analyze(claim);

    // 3. Market Evidence
    const mockObservation: MarketObservation = {
      asset: "SOL",
      price: 180,
      observedAt: new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
      provider: "Binance Spot",
      metrics: { priceChangePercent: -0.5 },
    };

    const analysisRecord: Analysis = {
      id: analysisId,
      claim,
      createdAt: new Date().toISOString(),
      verificationStatus: verificationResult.status,
      sentiment: analysisOutput.sentiment,
      regulatoryRisk: analysisOutput.regulatoryRisk,
      summary: analysisOutput.summary,
      uncertaintyNotes: analysisOutput.uncertaintyNotes,
      affectedAssets: ["SOL"],
    };

    // 4. Decision Engine Evaluation
    const engine = new DecisionEngine();
    const engineResult = engine.evaluate(
      analysisRecord,
      [newsEvidence],
      mockObservation
    );

    // MUST be NO_TRADE
    expect(engineResult.decision.outcome).toBe("NO_TRADE");
    expect(engineResult.decision.rejectionReasons.length).toBeGreaterThan(0);
    expect(engineResult.proposedTrade).toBeUndefined();

    // Persist and check audit
    await saveAnalysis(analysisRecord);
    await saveEvidence(newsEvidence);
    await saveDecision(engineResult.decision);

    const auditRecord = await getAnalysisById(analysisId);
    expect(auditRecord.decision?.outcome).toBe("NO_TRADE");
    expect(auditRecord.paperTrade).toBeNull();
  });
});
