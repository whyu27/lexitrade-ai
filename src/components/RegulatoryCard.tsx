"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, HelpCircle, ShieldAlert, Globe } from "lucide-react";
import type { Analysis } from "@/lib/schemas";

interface RegulatoryCardProps {
  analysis: Analysis;
}

export function RegulatoryCard({ analysis }: RegulatoryCardProps) {
  const getSentimentBadge = (sentiment: Analysis["sentiment"]) => {
    switch (sentiment) {
      case "BULLISH":
        return {
          icon: TrendingUp,
          color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          label: "BULLISH",
        };
      case "BEARISH":
        return {
          icon: TrendingDown,
          color: "border-rose-500/30 bg-rose-500/10 text-rose-400",
          label: "BEARISH",
        };
      case "UNCERTAIN":
        return {
          icon: HelpCircle,
          color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
          label: "UNCERTAIN",
        };
      case "NEUTRAL":
      default:
        return {
          icon: Minus,
          color: "border-slate-500/30 bg-slate-500/10 text-slate-400",
          label: "NEUTRAL",
        };
    }
  };

  const getRiskBadge = (risk: Analysis["regulatoryRisk"]) => {
    switch (risk) {
      case "LOW":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "MEDIUM":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
      case "HIGH":
        return "border-rose-500/30 bg-rose-500/10 text-rose-400";
      case "UNKNOWN":
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-400";
    }
  };

  const sentimentBadge = getSentimentBadge(analysis.sentiment);
  const SentimentIcon = sentimentBadge.icon;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          2. Regulatory & Sentiment Analysis
        </span>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${sentimentBadge.color}`}>
            <SentimentIcon className="h-3 w-3" />
            {sentimentBadge.label}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${getRiskBadge(analysis.regulatoryRisk)}`}>
            Risk: {analysis.regulatoryRisk}
          </span>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <span>Jurisdiction:</span>
            <span className="font-semibold text-slate-200">{analysis.jurisdiction || "Global"}</span>
          </div>

          <span className="text-slate-600">•</span>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Affected:</span>
            <div className="flex gap-1">
              {analysis.affectedAssets.map((asset) => (
                <span
                  key={asset}
                  className="rounded bg-slate-800 px-1.5 py-0.2 font-mono text-cyan-300 font-semibold"
                >
                  {asset}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">
          {analysis.summary}
        </p>

        {analysis.uncertaintyNotes && analysis.uncertaintyNotes.length > 0 && (
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-amber-400 mb-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Uncertainty & Caveats:</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              {analysis.uncertaintyNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
