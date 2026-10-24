"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck, Scale, Cpu, Activity, Database, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <Logo size="md" showWordmark={false} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                  System Architecture & Bounty Specifications
                </h2>
                <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono text-[10px] text-emerald-400 font-medium">
                  BLI HACKATHON 2
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                RYO-CHAN Bounty Track: Autonomous Agents • Deterministic Legal-Trading Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Executive Summary */}
        <div className="rounded border border-zinc-800/80 bg-zinc-900/30 p-4 mb-5">
          <div className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Problem & Autonomous Solution</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            In crypto markets, fake regulatory news and unverified social media rumors trigger sudden, severe volatility. Traditional LLM wrappers hallucinate or trade recklessly on unconfirmed headlines. <strong className="text-white">LexiTrade AI</strong> is an autonomous agent that acts as an unyielding compliance gatekeeper: it independently verifies primary source text against regulatory archives, audits live Binance Spot market conditions, applies a strict 6-rule deterministic decision engine, and executes simulated practice trades with automated risk management.
          </p>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div className="mb-6">
          <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400 mb-2">
            Execution Pipeline Topology
          </h3>
          <div className="rounded border border-zinc-800 bg-zinc-900/60 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto leading-relaxed">
            <div className="min-w-[620px] space-y-1">
              <div className="text-zinc-500 font-bold">[STEP 1: INGESTION]</div>
              <div className="text-zinc-300">Regulatory Headline / Claim + Primary Source URL Anchor</div>
              <div className="text-zinc-600">   │</div>
              <div className="text-zinc-600">   ▼</div>
              <div className="text-zinc-500 font-bold">[STEP 2: INDEPENDENT VERIFICATION]</div>
              <div className="text-zinc-300">Web Scraper (Cheerio) extracts official source text &amp; cross-checks token polarity</div>
              <div className="text-zinc-400">   ├── Status: <span className="text-emerald-400 font-bold">VERIFIED</span> (Source confirms claim)</div>
              <div className="text-zinc-400">   └── Status: <span className="text-rose-400">UNVERIFIED / CONFLICTING / UNAVAILABLE</span> ──► <span className="text-rose-400 font-bold">[GATEKEEPER BLOCKS]</span></div>
              <div className="text-zinc-600">   │</div>
              <div className="text-zinc-600">   ▼</div>
              <div className="text-zinc-500 font-bold">[STEP 3: REGULATORY CLASSIFICATION &amp; MARKET EVIDENCE]</div>
              <div className="text-zinc-300">Dual-layer sentiment extraction (Target Asset, Score &gt;= 0.65) + Binance Spot Real-Time Ticker (&lt;300s freshness)</div>
              <div className="text-zinc-600">   │</div>
              <div className="text-zinc-600">   ▼</div>
              <div className="text-zinc-500 font-bold">[STEP 4: DETERMINISTIC 6-RULE GATEKEEPER]</div>
              <div className="text-zinc-300">Rule 1: Status=VERIFIED • Rule 2: Sentiment=POS/PERMISSIVE • Rule 3: Impact&gt;=0.65 • Rule 4: Ticker Fresh • Rule 5: Volatility &lt;20% • Rule 6: Asset Match</div>
              <div className="text-zinc-400">   ├── Any rule fails (evaluated deterministically) ──► <span className="text-amber-400 font-bold">DECISION: NO_TRADE</span></div>
              <div className="text-zinc-400">   └── All 6 rules pass unanimously ───────────────► <span className="text-emerald-400 font-bold">DECISION: BUY</span></div>
              <div className="text-zinc-600">   │</div>
              <div className="text-zinc-600">   ▼</div>
              <div className="text-zinc-500 font-bold">[STEP 5: SIMULATED EXECUTION &amp; AUDIT LEDGER]</div>
              <div className="text-zinc-300">Allocates 5% virtual capital ($5,000) • Fixed -3.00% Stop-Loss • Fixed +6.00% Take-Profit • Logged to SQLite ledger</div>
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="rounded border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Scale className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>1. Regulatory Anti-Hallucination Guard</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Unlike generic LLM bots, LexiTrade requires an auditable factual anchor. If a news claim cannot be verified against official agency text (e.g. SEC archives, gazettes), the trade is immediately aborted.
            </p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Activity className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>2. Real-Time Market Grounding</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Direct integration with live Binance Spot REST APIs and CoinPaprika fallback. Enforces strict freshness validation (&lt;300s TTL) and sanity volatility checks before calculating order viability.
            </p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Cpu className="h-4 w-4 text-purple-400 shrink-0" />
              <span>3. Deterministic 6-Rule Engine</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Zero black-box decisions. Every recommendation is produced by explicit Boolean logic that generates clear pass/fail evidence, fully inspectable for compliance and regulatory reporting.
            </p>
          </div>

          <div className="rounded border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Database className="h-4 w-4 text-amber-400 shrink-0" />
              <span>4. Practice Sandbox &amp; SHA-256 Audit Chain</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Strictly virtual sandbox ($100,000 baseline) preventing capital risk. Every analysis step, claim hash, and simulated execution order is chained with SHA-256 cryptographic hashes in SQLite, guaranteeing tamper-evident audit integrity.
            </p>
          </div>
        </div>

        {/* Bounty Checklist */}
        <div className="rounded border border-zinc-800 bg-zinc-900/20 p-4">
          <div className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider mb-2">
            RYO-CHAN Autonomous Agent Bounty Alignment
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Autonomous end-to-end execution</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Auditable legal explanation trail</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Real-time Binance Spot market data</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>SHA-256 cryptographic audit ledger chaining</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
          <span className="font-mono text-[11px] text-zinc-500">
            Press ESC or click button to close
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-100 px-4 py-1.5 font-mono text-xs font-semibold text-zinc-950 hover:bg-white transition-colors cursor-pointer"
          >
            <span>ENTER TERMINAL</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
