"use client";

import React from "react";
import { ShieldCheck, Database, Radio, Wallet, History, BookOpen } from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "analyses" | "trades";
  setActiveTab: (tab: "dashboard" | "analyses" | "trades") => void;
  analysisCount?: number;
  openTradesCount?: number;
}

export function Navbar({
  activeTab,
  setActiveTab,
  analysisCount = 0,
  openTradesCount = 0,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-slate-950 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                LexiTrade<span className="text-emerald-400">AI</span>
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                BLI Hackathon 2 • RYO-CHAN
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              From Regulatory News to Explainable Practice Trades
            </p>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Feed:</span>
            <span className="font-medium text-emerald-300">Binance Spot</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-400">Trail:</span>
            <span className="font-medium text-cyan-300">SQLite Ledger</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-slate-300">
            <Wallet className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Balance:</span>
            <span className="font-medium text-amber-300">$100,000 (Paper)</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Agent</span>
          </button>

          <button
            onClick={() => setActiveTab("analyses")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "analyses"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Ledger</span>
            {analysisCount > 0 && (
              <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-300">
                {analysisCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("trades")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === "trades"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Paper Trades</span>
            {openTradesCount > 0 && (
              <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                {openTradesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
