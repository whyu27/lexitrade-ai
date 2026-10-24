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
import { AlertCircle } from "lucide-react";

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
        throw new Error(json.error || "Pipeline execution failed");
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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        analysisCount={analysesList.length}
        openTradesCount={openTradesCount}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-4 sm:px-6">
        {/* Global Error Alert */}
        {globalError && (
          <div className="mb-4 flex items-center justify-between rounded border border-rose-900/50 bg-rose-950/20 px-3.5 py-2 font-mono text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>ERROR: {globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError(null)}
              className="text-zinc-500 hover:text-white"
            >
              [DISMISS]
            </button>
          </div>
        )}

        {/* Terminal Workspace Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-4">
            {/* Input Dispatcher */}
            <AnalysisForm onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Execution Pipeline Results */}
            {currentResult && (
              <div className="space-y-3 pt-1">
                {/* Real-Time Market Ticker Header */}
                <MarketCard
                  observation={currentResult.marketObservation}
                  error={currentResult.marketError}
                  asset={currentResult.primaryAsset}
                />

                {/* 2-Column Institutional Terminal Grid */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 items-start">
                  {/* Left Column: Evidence & Verification */}
                  <div className="space-y-3">
                    <VerificationCard
                      analysis={currentResult.analysis}
                      evidences={currentResult.evidences}
                    />
                    <RegulatoryCard analysis={currentResult.analysis} />
                  </div>

                  {/* Right Column: Deterministic Rule Matrix & Practice Execution */}
                  <div className="space-y-3">
                    <DecisionCard decision={currentResult.decision} />
                    {currentResult.paperTrade && (
                      <PaperTradeCard
                        trade={currentResult.paperTrade}
                        onCloseTrade={handleCloseTrade}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Ledger Tab */}
        {activeTab === "analyses" && (
          <AnalysesLedgerView
            analyses={analysesList}
            onSelectAnalysis={(id) => setInspectId(id)}
          />
        )}

        {/* Positions Tab */}
        {activeTab === "trades" && (
          <TradesHistoryView
            trades={tradesList}
            onCloseTrade={handleCloseTrade}
          />
        )}
      </main>

      {/* Audit Trail Inspector Modal */}
      <InspectModal
        analysisId={inspectId}
        onClose={() => setInspectId(null)}
      />

      {/* Terminal Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-3 font-mono text-[11px] text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-1 sm:px-6">
          <div className="flex items-center gap-2">
            <span>LEXITRADE/TERMINAL</span>
            <span className="text-zinc-700">•</span>
            <span>BLI LEGAL TECH HACKATHON 2 (RYO-CHAN TRACK)</span>
          </div>
          <div>
            <span>PRACTICE SIMULATION ONLY — VIRTUAL FUNDS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
