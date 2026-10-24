"use client";

import React from "react";
import { Logo } from "@/components/Logo";

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
    <header className="border-b border-zinc-800 bg-zinc-950 text-xs">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Logo size="sm" showWordmark={true} />

        {/* Center / Navigation Tabs */}
        <nav className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Terminal
          </button>

          <button
            onClick={() => setActiveTab("analyses")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "analyses"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Audit Ledger</span>
            {analysisCount > 0 && (
              <span className="rounded bg-zinc-800/80 border border-zinc-700 px-1 font-mono text-[10px] text-zinc-400">
                {analysisCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("trades")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "trades"
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Positions</span>
            {openTradesCount > 0 && (
              <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1 font-mono text-[10px] text-emerald-400 font-semibold">
                {openTradesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Minimal Right Status */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Binance Spot</span>
        </div>
      </div>
    </header>
  );
}
