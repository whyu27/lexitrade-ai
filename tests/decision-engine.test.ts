import { describe, it, expect } from "vitest";
import { DecisionEngine } from "../src/lib/engine/decision-engine";
import type { Analysis, Evidence, MarketObservation } from "../src/lib/schemas";

describe("Phase 4 — Deterministic Decision Engine", () => {
  const engine = new DecisionEngine();

  const createMockAnalysis = (overrides: Partial<Analysis> = {}): Analysis => ({
    id: "an-test-1",
    claim: "SEC officially approves Bitcoin spot ETF",
    sourceUrl: "https://example.com/sec-release",
    createdAt: new Date().toISOString(),
    verificationStatus: "VERIFIED",
    sentiment: "BULLISH",
    regulatoryRisk: "LOW",
    summary: "Approval granted",
    uncertaintyNotes: [],
    affectedAssets: ["BTC"],
    jurisdiction: "US",
    ...overrides,
  });

  const createMockObservation = (overrides: Partial<MarketObservation> = {}): MarketObservation => ({
    asset: "BTC",
    price: 80000,
    observedAt: new Date().toISOString(),
    retrievedAt: new Date().toISOString(),
    provider: "Binance Spot",
    metrics: {
      priceChangePercent: 2.5,
      volume: 10000,
    },
    ...overrides,
  });

  const mockEvidence: Evidence[] = [
    {
      id: "ev-1",
      analysisId: "an-test-1",
      type: "NEWS_SOURCE",
      provider: "Reuters",
      retrievedAt: new Date().toISOString(),
      payload: {},
    },
  ];

  it("should evaluate to BUY when all evidence and risk criteria are satisfied", () => {
    const analysis = createMockAnalysis();
    const observation = createMockObservation();

    const result = engine.evaluate(analysis, mockEvidence, observation);

    expect(result.decision.outcome).toBe("BUY");
    expect(result.decision.rejectionReasons.length).toBe(0);
    expect(result.decision.ruleResults.every((r) => r.passed)).toBe(true);
    expect(result.proposedTrade).toBeDefined();
    expect(result.proposedTrade?.asset).toBe("BTC");
    expect(result.proposedTrade?.entryPrice).toBe(80000);
    expect(result.proposedTrade?.stopLoss).toBeLessThan(80000);
    expect(result.proposedTrade?.takeProfit).toBeGreaterThan(80000);
  });

  it("should evaluate to NO_TRADE when news verification status is UNVERIFIED", () => {
    const analysis = createMockAnalysis({ verificationStatus: "UNVERIFIED" });
    const observation = createMockObservation();

    const result = engine.evaluate(analysis, mockEvidence, observation);

    expect(result.decision.outcome).toBe("NO_TRADE");
    expect(result.decision.rejectionReasons.some((r) => r.includes("RULE_VERIFIED_NEWS") || r.includes("UNVERIFIED"))).toBe(true);
    expect(result.proposedTrade).toBeUndefined();
  });

  it("should evaluate to NO_TRADE when news verification status is CONFLICTING", () => {
    const analysis = createMockAnalysis({ verificationStatus: "CONFLICTING" });
    const observation = createMockObservation();

    const result = engine.evaluate(analysis, mockEvidence, observation);

    expect(result.decision.outcome).toBe("NO_TRADE");
    expect(result.proposedTrade).toBeUndefined();
  });

  it("should evaluate to NO_TRADE when sentiment is BEARISH or UNCERTAIN", () => {
    const bearishAnalysis = createMockAnalysis({ sentiment: "BEARISH" });
    const observation = createMockObservation();

    const result = engine.evaluate(bearishAnalysis, mockEvidence, observation);

    expect(result.decision.outcome).toBe("NO_TRADE");
    expect(result.decision.rejectionReasons.some((r) => r.includes("BULLISH sentiment"))).toBe(true);
  });

  it("should evaluate to NO_TRADE when regulatory risk is HIGH", () => {
    const highRiskAnalysis = createMockAnalysis({ regulatoryRisk: "HIGH" });
    const observation = createMockObservation();

    const result = engine.evaluate(highRiskAnalysis, mockEvidence, observation);

    expect(result.decision.outcome).toBe("NO_TRADE");
    expect(result.decision.rejectionReasons.some((r) => r.includes("tolerance limit"))).toBe(true);
  });

  it("should evaluate to NO_TRADE when market observation is stale", () => {
    const staleTime = new Date(Date.now() - 600 * 1000).toISOString(); // 10 minutes old
    const staleObservation = createMockObservation({ observedAt: staleTime });
    const analysis = createMockAnalysis();

    const result = engine.evaluate(analysis, mockEvidence, staleObservation);

    expect(result.decision.outcome).toBe("NO_TRADE");
    expect(result.decision.rejectionReasons.some((r) => r.includes("stale"))).toBe(true);
  });

  it("should evaluate to NO_TRADE when 24h market drop exceeds allowable threshold", () => {
    const dumpingObservation = createMockObservation({
      metrics: { priceChangePercent: -8.5 },
    });
    const analysis = createMockAnalysis();

    const result = engine.evaluate(analysis, mockEvidence, dumpingObservation);

    expect(result.decision.outcome).toBe("NO_TRADE");
    expect(result.decision.rejectionReasons.some((r) => r.includes("stability threshold"))).toBe(true);
  });

  it("should be strictly deterministic for identical inputs", () => {
    const analysis = createMockAnalysis();
    const observation = createMockObservation();

    const res1 = engine.evaluate(analysis, mockEvidence, observation);
    const res2 = engine.evaluate(analysis, mockEvidence, observation);

    expect(res1.decision.outcome).toBe(res2.decision.outcome);
    expect(res1.decision.ruleResults.length).toBe(res2.decision.ruleResults.length);
    expect(res1.decision.ruleResults.map((r) => r.passed)).toEqual(
      res2.decision.ruleResults.map((r) => r.passed)
    );
  });
});
