"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { AnalysisForm } from "@/components/AnalysisForm";
import { VerificationCard } from "@/components/VerificationCard";
import { RegulatoryCard } from "@/components/RegulatoryCard";
import { MarketCard } from "@/components/MarketCard";
import { DecisionCard } from "@/components/DecisionCard";
import { PaperTradeCard } from "@/components/PaperTradeCard";
import { AnalysesLedgerView, TradesHistoryView } from "@/components/HistoryViews";
import { InspectModal } from "@/components/InspectModal";
import type {
  Analysis,
  Evidence,
  Decision,
  PaperTrade,
  MarketObservation,
} from "@/lib/schemas";
import { ShieldCheck, ArrowRight, BookOpen, AlertCircle } from "lucide-react";

interface PipelineResult {
  analysis: Analysis;
  evidences: Evidence[];
  decision: Decision;
  paperTrade: PaperTrade | null;
  primaryAsset: string;
  marketObservation: MarketObservation | null;
  marketError?: string | null;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "analyses" | "trades">("dashboard");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<PipelineResult | null>(null);
  const [analysesList, setAnalysesList] = useState<Analysis[]>([]);
  const [tradesList, setTradesList] = useState<PaperTrade[]>([]);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loadHistoricalData = async () => {
    try {
      const [resAnalyses, resTrades] = await Promise.all([
        fetch("/api/analyses"),
        fetch("/api/trades"),
      ]);

      const [jsonAnalyses, jsonTrades] = await Promise.all([
        resAnalyses.json(),
        resTrades.json(),
      ]);

      if (jsonAnalyses.success) setAnalysesList(jsonAnalyses.data);
      if (jsonTrades.success) setTradesList(jsonTrades.data);
    } catch (err) {
      console.error("Failed to load historical data:", err);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, []);

  const handleAnalyze = async (claim: string, sourceUrl: string, targetAsset: string) => {
    setIsLoading(true);
    setGlobalError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, sourceUrl, targetAsset }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Analysis pipeline execution failed");
      }

      setCurrentResult(json.data);
      setActiveTab("dashboard");
      await loadHistoricalData();
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    try {
      const res = await fetch(`/api/trades/${tradeId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();
      if (json.success) {
        // Update current result if matching
        if (currentResult?.paperTrade?.id === tradeId) {
          setCurrentResult({
            ...currentResult,
            paperTrade: json.data,
          });
        }
        await loadHistoricalData();
      }
    } catch (err) {
      console.error("Failed to close paper trade:", err);
    }
  };

  const openTradesCount = tradesList.filter((t) => t.status === "OPEN").length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        analysisCount={analysesList.length}
        openTradesCount={openTradesCount}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {/* Global Error Banner */}
        {globalError && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Mission Banner */}
            <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-950 p-6 shadow-xl">
              <div className="max-w-3xl space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Autonomous Web3 Agent Architecture
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Regulatory News to Explainable Practice Trades
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  LexiTrade AI bridges cryptocurrency regulatory claims with verified market evidence. 
                  Every practice trade is governed by deterministic rules, auditable risk limits, and a permanent decision ledger — completely eliminating ungrounded AI hallucinations.
                </p>
              </div>

              {/* Workflow Pill Steps */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1">1. News Input</span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1">2. Source Scraping</span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1">3. Live Binance Spot</span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1">4. 6-Rule Decision Engine</span>
                <ArrowRight className="h-3 w-3 text-slate-600" />
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-2 py-1">5. Audited Paper Trade</span>
              </div>
            </div>

            {/* Input Form */}
            <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Current Pipeline Result Section */}
            {currentResult && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">
                    Execution Pipeline Evidence & Audit Trail
                  </h3>
                  <span className="font-mono text-xs text-slate-500">
                    Ref: {currentResult.analysis.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <VerificationCard
                    analysis={currentResult.analysis}
                    evidences={currentResult.evidences}
                  />
                  <RegulatoryCard analysis={currentResult.analysis} />
                </div>

                <MarketCard
                  observation={currentResult.marketObservation}
                  error={currentResult.marketError}
                  asset={currentResult.primaryAsset}
                />

                <DecisionCard decision={currentResult.decision} />

                {currentResult.paperTrade && (
                  <PaperTradeCard
                    trade={currentResult.paperTrade}
                    onCloseTrade={handleCloseTrade}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Analyses Ledger Tab */}
        {activeTab === "analyses" && (
          <AnalysesLedgerView
            analyses={analysesList}
            onSelectAnalysis={(id) => setInspectId(id)}
          />
        )}

        {/* Paper Trades Tab */}
        {activeTab === "trades" && (
          <TradesHistoryView
            trades={tradesList}
            onCloseTrade={handleCloseTrade}
          />
        )}
      </main>

      {/* Inspect Record Modal */}
      <InspectModal
        analysisId={inspectId}
        onClose={() => setInspectId(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LexiTrade AI • BLI Legal Tech Hackathon 2 (RYO-CHAN Track)</span>
          <span>Practice Paper Trading Engine • Virtual Funds Only</span>
        </div>
      </footer>
    </div>
  );
}
