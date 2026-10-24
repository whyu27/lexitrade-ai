"use client";

import React, { useState } from "react";
import { Play, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";

interface AnalysisFormProps {
  onAnalyze: (claim: string, sourceUrl: string, targetAsset: string) => Promise<void>;
  isLoading: boolean;
}

const TEST_FIXTURES = [
  {
    id: "fixture-buy",
    name: "01. ETF Approval (Eligible BUY)",
    badge: "PASS CRITERIA",
    badgeClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    claim: "Securities and Exchange Commission grants formal regulatory approval for Bitcoin spot ETF listing and trading across US national exchanges.",
    sourceUrl: "https://www.sec.gov/news/press-release",
    asset: "BTC",
  },
  {
    id: "fixture-unverified",
    name: "02. Social Media Rumor",
    badge: "UNVERIFIED FAIL",
    badgeClass: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    claim: "Unconfirmed rumors allege the Federal Reserve will adopt Solana blockchain for real-time interbank settlement rails next quarter.",
    sourceUrl: "",
    asset: "SOL",
  },
  {
    id: "fixture-conflict",
    name: "03. Injunction Denial Contradiction",
    badge: "CONFLICT FAIL",
    badgeClass: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    claim: "SEC officially dismisses and drops all enforcement lawsuit charges against Ethereum foundation.",
    sourceUrl: "https://example.com/sec-lawsuit-active",
    asset: "ETH",
  },
];

export function AnalysisForm({ onAnalyze, isLoading }: AnalysisFormProps) {
  const [claim, setClaim] = useState(TEST_FIXTURES[0].claim);
  const [sourceUrl, setSourceUrl] = useState(TEST_FIXTURES[0].sourceUrl);
  const [targetAsset, setTargetAsset] = useState(TEST_FIXTURES[0].asset);
  const [activeFixture, setActiveFixture] = useState(TEST_FIXTURES[0].id);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!claim.trim() || isLoading) return;
    await onAnalyze(claim.trim(), sourceUrl.trim(), targetAsset);
  };

  const handleApplyFixture = (f: typeof TEST_FIXTURES[0]) => {
    setActiveFixture(f.id);
    setClaim(f.claim);
    setSourceUrl(f.sourceUrl);
    setTargetAsset(f.asset);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4">
      {/* Top Console Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-zinc-300">
            [INPUT DISPATCHER]
          </span>
          <span className="text-[11px] text-zinc-500">
            Submit claim for factual verification & deterministic evaluation
          </span>
        </div>

        {/* Test Fixture Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] text-zinc-500">FIXTURES:</span>
          {TEST_FIXTURES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleApplyFixture(f)}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                activeFixture === f.id
                  ? "border-zinc-500 bg-zinc-800 text-zinc-100"
                  : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {f.name.split(". ")[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="space-y-3 font-sans">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <label className="font-mono text-[11px] text-zinc-400 uppercase">
              Regulatory Statement / Headline:
            </label>
            <span className="font-mono text-[10px] text-zinc-500">
              Ctrl+Enter to evaluate
            </span>
          </div>
          <textarea
            value={claim}
            onChange={(e) => {
              setClaim(e.target.value);
              setActiveFixture("");
            }}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type or paste a regulatory news claim..."
            required
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-0 font-mono transition-colors resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-[11px] text-zinc-400 uppercase">
              Source URL Verification Anchor:
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => {
                setSourceUrl(e.target.value);
                setActiveFixture("");
              }}
              placeholder="https://... (Leave empty to test unverified rumor policy)"
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-0 transition-colors"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] text-zinc-400 uppercase">
              Asset Target:
            </label>
            <select
              value={targetAsset}
              onChange={(e) => {
                setTargetAsset(e.target.value);
                setActiveFixture("");
              }}
              className="w-full rounded border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none focus:ring-0 transition-colors font-mono"
            >
              <option value="BTC">BTC / USDT</option>
              <option value="ETH">ETH / USDT</option>
              <option value="SOL">SOL / USDT</option>
              <option value="XRP">XRP / USDT</option>
              <option value="DOGE">DOGE / USDT</option>
              <option value="ADA">ADA / USDT</option>
              <option value="BNB">BNB / USDT</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
            <span>RULE ENGINE: STRICT DETERMINISTIC (V1.0.0)</span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !claim.trim()}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-100 px-4 py-1.5 font-mono text-xs font-semibold text-zinc-950 transition-colors hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-zinc-950 border-t-transparent" />
                <span>EVALUATING PIPELINE...</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span>RUN PIPELINE</span>
                <span className="text-[10px] text-zinc-600 ml-1">↵</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
