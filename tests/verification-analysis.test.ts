import { describe, it, expect, vi, beforeEach } from "vitest";
import { NewsVerifier } from "../src/lib/verification/news-verifier";
import { RegulatoryAnalyzer } from "../src/lib/analysis/regulatory-analyzer";

describe("Phase 3 — News Verification & Regulatory Analysis", () => {
  let verifier: NewsVerifier;
  let analyzer: RegulatoryAnalyzer;

  beforeEach(() => {
    verifier = new NewsVerifier();
    analyzer = new RegulatoryAnalyzer();
    vi.restoreAllMocks();
  });

  describe("NewsVerifier", () => {
    it("should mark claim as UNVERIFIED if no source URL is provided", async () => {
      const result = await verifier.verifyClaim("SEC approves Solana ETF");
      expect(result.status).toBe("UNVERIFIED");
      expect(result.reason).toContain("No independent source URL provided");
    });

    it("should mark claim as UNAVAILABLE if source URL returns 404 or fails", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as unknown as Response);

      const result = await verifier.verifyClaim(
        "SEC approves Solana ETF",
        "https://example.com/missing-article"
      );
      expect(result.status).toBe("UNAVAILABLE");
      expect(result.reason).toContain("404");
    });

    it("should mark claim as VERIFIED when source HTML corroborates the claim", async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html>
          <head><title>SEC Formally Approves First Solana ETF</title></head>
          <body>
            <article>
              <h1>SEC Approves Solana Spot ETF for US Markets</h1>
              <p>The Securities and Exchange Commission has granted official approval for the first Solana spot ETF, clearing the way for trading to commence.</p>
            </article>
          </body>
        </html>
      `;

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => mockHtml,
      } as unknown as Response);

      const result = await verifier.verifyClaim(
        "SEC approves Solana ETF trading",
        "https://reuters.com/sec-solana-etf"
      );

      expect(result.status).toBe("VERIFIED");
      expect(result.matchedKeywords.length).toBeGreaterThanOrEqual(2);
      expect(result.conflictingTerms.length).toBe(0);
    });

    it("should mark claim as CONFLICTING when source content contradicts the claim", async () => {
      const mockConflictHtml = `
        <!DOCTYPE html>
        <html>
          <head><title>SEC Denies and Rejects Solana ETF Application</title></head>
          <body>
            <p>The SEC has denied and rejected the proposed Solana spot ETF filing, citing market surveillance concerns.</p>
          </body>
        </html>
      `;

      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "text/html" }),
        text: async () => mockConflictHtml,
      } as unknown as Response);

      const result = await verifier.verifyClaim(
        "SEC approves Solana ETF application",
        "https://sec.gov/news/press-release"
      );

      expect(result.status).toBe("CONFLICTING");
      expect(result.conflictingTerms.length).toBeGreaterThan(0);
      expect(result.reason).toContain("conflict");
    });

    it("should generate a valid audit-trail Evidence object", async () => {
      const result = await verifier.verifyClaim("SEC approves BTC ETF");
      const evidence = verifier.createNewsEvidence("an-100", result);

      expect(evidence.analysisId).toBe("an-100");
      expect(evidence.type).toBe("NEWS_SOURCE");
      expect(evidence.payload.status).toBe("UNVERIFIED");
    });
  });

  describe("RegulatoryAnalyzer", () => {
    it("should identify bullish sentiment and low regulatory risk for ETF approvals", async () => {
      const output = await analyzer.analyze("SEC grants formal ETF approval for Bitcoin");
      expect(output.sentiment).toBe("BULLISH");
      expect(output.regulatoryRisk).toBe("LOW");
      expect(output.affectedAssets).toContain("BTC");
      expect(output.jurisdiction).toBe("US");
    });

    it("should identify bearish sentiment and high regulatory risk for enforcement lawsuits", async () => {
      const output = await analyzer.analyze("DOJ and SEC file joint lawsuit and criminal fraud charges against crypto firm");
      expect(output.sentiment).toBe("BEARISH");
      expect(output.regulatoryRisk).toBe("HIGH");
      expect(output.uncertaintyNotes.length).toBeGreaterThan(0);
    });

    it("should identify uncertain sentiment for regulatory delays or reviews", async () => {
      const output = await analyzer.analyze("SEC delays decision on Solana ETF review period");
      expect(output.sentiment).toBe("UNCERTAIN");
      expect(output.regulatoryRisk).toBe("MEDIUM");
      expect(output.affectedAssets).toContain("SOL");
    });

    it("should detect European Union jurisdiction for MiCA regulations", async () => {
      const output = await analyzer.analyze("ESMA issues new guidance under MiCA framework for Ethereum stablecoins");
      expect(output.jurisdiction).toBe("EU");
      expect(output.affectedAssets).toContain("ETH");
    });
  });
});
