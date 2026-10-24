import { NextRequest, NextResponse } from "next/server";
import { AnalyzeRequestSchema, type Analysis, type Evidence } from "@/lib/schemas";
import { getNewsVerifier } from "@/lib/verification/news-verifier";
import { getRegulatoryAnalyzer } from "@/lib/analysis/regulatory-analyzer";
import { getMarketDataService, StaleMarketDataError } from "@/lib/market";
import { saveAnalysis, saveEvidence } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request payload",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { claim, sourceUrl, targetAsset } = parsed.data;
    const analysisId = `an-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const createdAt = new Date().toISOString();

    // 1. News Verification
    const verifier = getNewsVerifier();
    const verificationResult = await verifier.verifyClaim(claim, sourceUrl || undefined);
    const newsEvidence = verifier.createNewsEvidence(analysisId, verificationResult);

    // 2. Regulatory & Sentiment Analysis
    const analyzer = getRegulatoryAnalyzer();
    const analysisOutput = await analyzer.analyze(
      claim,
      verificationResult.extractedExcerpt
    );

    // 3. Resolve Target Asset
    const primaryAsset = targetAsset && targetAsset.trim().length > 0
      ? targetAsset.trim().toUpperCase()
      : (analysisOutput.affectedAssets[0] || "BTC");

    // 4. Fetch Market Evidence
    const marketService = getMarketDataService();
    let marketObservation = null;
    let marketEvidence: Evidence | null = null;
    let marketError: string | null = null;

    try {
      marketObservation = await marketService.getMarketObservation(primaryAsset, {
        allowStale: false,
      });
      marketEvidence = marketService.createMarketEvidence(analysisId, marketObservation);
    } catch (err: unknown) {
      if (err instanceof StaleMarketDataError) {
        marketError = `Stale market data: ${err.message}`;
      } else {
        marketError = err instanceof Error ? err.message : String(err);
      }
    }

    // 5. Construct Analysis Record
    const analysisRecord: Analysis = {
      id: analysisId,
      claim,
      sourceUrl: sourceUrl || undefined,
      createdAt,
      verificationStatus: verificationResult.status,
      sentiment: analysisOutput.sentiment,
      regulatoryRisk: analysisOutput.regulatoryRisk,
      summary: analysisOutput.summary,
      uncertaintyNotes: [
        ...analysisOutput.uncertaintyNotes,
        ...(marketError ? [`Market Data Warning: ${marketError}`] : []),
      ],
      affectedAssets: analysisOutput.affectedAssets,
      jurisdiction: analysisOutput.jurisdiction,
    };

    // 6. Persist to Database
    await saveAnalysis(analysisRecord);
    await saveEvidence(newsEvidence);
    if (marketEvidence) {
      await saveEvidence(marketEvidence);
    }

    const allEvidences = [newsEvidence, ...(marketEvidence ? [marketEvidence] : [])];

    return NextResponse.json({
      success: true,
      data: {
        analysis: analysisRecord,
        evidences: allEvidences,
        primaryAsset,
        marketObservation,
        marketError,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
