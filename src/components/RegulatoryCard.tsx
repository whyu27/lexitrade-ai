"use client";

import React from "react";
import type { Analysis } from "@/lib/schemas";

interface RegulatoryCardProps {
  analysis: Analysis;
}

export function RegulatoryCard({ analysis }: RegulatoryCardProps) {
  const getSentimentColor = (sentiment: Analysis["sentiment"]) => {
    switch (sentiment) {
      case "BULLISH":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
      case "BEARISH":
        return "border-rose-500/40 bg-rose-500/10 text-rose-400";
      case "UNCERTAIN":
        return "border-amber-500/40 bg-amber-500/10 text-amber-400";
      case "NEUTRAL":
      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-300";
    }
  };

  const getRiskColor = (risk: Analysis["regulatoryRisk"]) => {
    switch (risk) {
      case "LOW":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
      case "MEDIUM":
        return "border-amber-500/40 bg-amber-500/10 text-amber-400";
      case "HIGH":
        return "border-rose-500/40 bg-rose-500/10 text-rose-400";
      case "UNKNOWN":
      default:
        return "border-zinc-700 bg-zinc-800 text-zinc-300";
    }
  };

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-semibold text-zinc-300">
          [REGULATORY INTELLIGENCE DOSSIER]
        </span>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className={`rounded border px-2 py-0.5 font-bold ${getSentimentColor(analysis.sentiment)}`}>
            SENTIMENT: {analysis.sentiment}
          </span>
          <span className={`rounded border px-2 py-0.5 font-bold ${getRiskColor(analysis.regulatoryRisk)}`}>
            RISK: {analysis.regulatoryRisk}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 font-sans">
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-zinc-400">
          <div>
            <span className="text-zinc-500">JURISDICTION:</span>{" "}
            <span className="text-zinc-200 font-semibold">{analysis.jurisdiction || "GLOBAL"}</span>
          </div>

          <span className="text-zinc-700">|</span>

          <div>
            <span className="text-zinc-500">AFFECTED ASSETS:</span>{" "}
            <span className="text-zinc-200 font-semibold">
              {analysis.affectedAssets.join(", ") || "BTC"}
            </span>
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-0.5">
            Synthesis Summary:
          </span>
          <p className="text-xs text-zinc-200 leading-relaxed">
            {analysis.summary}
          </p>
        </div>

        {analysis.uncertaintyNotes && analysis.uncertaintyNotes.length > 0 && (
          <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px]">
            <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block mb-1">
              Caveats & Uncertainty Vectors:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
              {analysis.uncertaintyNotes.map((note, idx) => (
                <li key={idx} className="leading-snug">{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
