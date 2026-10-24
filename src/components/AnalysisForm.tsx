"use client";

import React, { useState } from "react";
import { Send, Sparkles, AlertCircle, Link2, Coins } from "lucide-react";

interface AnalysisFormProps {
  onAnalyze: (claim: string, sourceUrl: string, targetAsset: string) => Promise<void>;
  isLoading: boolean;
}

const PRESETS = [
  {
    id: "preset-buy",
    label: "Scenario 1: Verified Spot ETF Approval",
    tag: "Eligible BUY",
    tagColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    claim: "Securities and Exchange Commission grants formal regulatory approval for Bitcoin spot ETF listing and trading across US national exchanges.",
    sourceUrl: "https://www.sec.gov/news/press-release",
    asset: "BTC",
  },
  {
    id: "preset-unverified",
    label: "Scenario 2: Unverified Social Rumor",
    tag: "NO TRADE (Unverified)",
    tagColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    claim: "Unconfirmed rumors allege the Federal Reserve will adopt Solana blockchain for real-time interbank settlement rails next quarter.",
    sourceUrl: "",
    asset: "SOL",
  },
  {
    id: "preset-conflict",
    label: "Scenario 3: Contradictory Legal Denial",
    tag: "NO TRADE (Contradiction)",
    tagColor: "border-rose-500/30 bg-rose-500/10 text-rose-400",
    claim: "SEC officially dismisses and drops all enforcement lawsuit charges against Ethereum foundation.",
    sourceUrl: "https://example.com/sec-lawsuit-active",
    asset: "ETH",
  },
];

export function AnalysisForm({ onAnalyze, isLoading }: AnalysisFormProps) {
  const [claim, setClaim] = useState(PRESETS[0].claim);
  const [sourceUrl, setSourceUrl] = useState(PRESETS[0].sourceUrl);
  const [targetAsset, setTargetAsset] = useState(PRESETS[0].asset);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) return;
    await onAnalyze(claim.trim(), sourceUrl.trim(), targetAsset);
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setClaim(preset.claim);
    setSourceUrl(preset.sourceUrl);
    setTargetAsset(preset.asset);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl backdrop-blur-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
            Submit Regulatory Claim for Autonomous Analysis
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Deterministic Rules & Market Verification
        </span>
      </div>

      {/* Preset Scenarios */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-medium text-slate-400">
          Interactive Demo Presets:
        </label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="flex flex-col items-start rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-left transition-all hover:border-slate-700 hover:bg-slate-900"
            >
              <div className="flex w-full items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-slate-200 truncate">
                  {preset.asset} Scenario
                </span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium border ${preset.tagColor}`}>
                  {preset.tag}
                </span>
              </div>
              <p className="line-clamp-2 text-[11px] text-slate-400 leading-tight">
                {preset.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 flex items-center justify-between text-xs font-medium text-slate-300">
            <span>Regulatory News Claim <span className="text-rose-400">*</span></span>
            <span className="text-[11px] text-slate-500">Min 5 characters</span>
          </label>
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            rows={3}
            placeholder="e.g. SEC grants formal approval for Ethereum spot ETF trading starting next Tuesday..."
            required
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Link2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Independent Source URL (Optional)</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://www.sec.gov/news/pressreleases/..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              Without a verifiable source URL, claim will receive <span className="text-amber-400">UNVERIFIED</span> status.
            </p>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Coins className="h-3.5 w-3.5 text-slate-400" />
              <span>Target Asset</span>
            </label>
            <select
              value={targetAsset}
              onChange={(e) => setTargetAsset(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="BTC">BTC (Bitcoin)</option>
              <option value="ETH">ETH (Ethereum)</option>
              <option value="SOL">SOL (Solana)</option>
              <option value="XRP">XRP (Ripple)</option>
              <option value="DOGE">DOGE (Dogecoin)</option>
              <option value="ADA">ADA (Cardano)</option>
              <option value="BNB">BNB (Binance)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <AlertCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simulated paper execution only • No real funds</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !claim.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Running Pipeline...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Analyze & Execute</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
