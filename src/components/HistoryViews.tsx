"use client";

import React from "react";
import { History, BookOpen, ExternalLink, ArrowUpRight } from "lucide-react";
import type { Analysis, PaperTrade } from "@/lib/schemas";

interface AnalysesLedgerViewProps {
  analyses: Analysis[];
  onSelectAnalysis: (id: string) => void;
}

export function AnalysesLedgerView({
  analyses,
  onSelectAnalysis,
}: AnalysesLedgerViewProps) {
  if (analyses.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
        <History className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">No Analyses Recorded Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          Submit a regulatory news claim in the agent dashboard to create your first auditable record.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Persistent Regulatory News & Analysis Ledger
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {analyses.length} Total Records
        </span>
      </div>

      <div className="divide-y divide-slate-800/80">
        {analyses.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectAnalysis(item.id)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 transition-colors hover:bg-slate-850/40 cursor-pointer rounded-lg px-2 -mx-2"
          >
            <div className="space-y-1 min-w-0 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">
                  [{item.affectedAssets.join(", ") || "BTC"}]
                </span>
                <span className={`rounded-full px-2 py-0.2 text-[10px] font-bold border ${
                  item.verificationStatus === "VERIFIED"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : item.verificationStatus === "CONFLICTING"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}>
                  {item.verificationStatus}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-200 line-clamp-1 font-medium">
                {item.claim}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                item.sentiment === "BULLISH"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : item.sentiment === "BEARISH"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {item.sentiment}
              </span>
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:border-slate-600"
              >
                <span>Inspect</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TradesHistoryViewProps {
  trades: PaperTrade[];
  onCloseTrade?: (tradeId: string) => Promise<void>;
}

export function TradesHistoryView({
  trades,
  onCloseTrade,
}: TradesHistoryViewProps) {
  if (trades.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-slate-600 mb-2" />
        <h3 className="text-sm font-semibold text-slate-300">No Paper Trades Opened Yet</h3>
        <p className="text-xs text-slate-500 mt-1">
          Simulated paper trades are executed automatically when an eligible claim satisfies all 6 deterministic rules.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Simulated Paper Positions & Practice Trades
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {trades.length} Positions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase">
            <tr>
              <th className="pb-2.5">Asset / Dir</th>
              <th className="pb-2.5">Size</th>
              <th className="pb-2.5">Entry</th>
              <th className="pb-2.5">Stop-Loss</th>
              <th className="pb-2.5">Take-Profit</th>
              <th className="pb-2.5">Status</th>
              <th className="pb-2.5">Realized PnL</th>
              <th className="pb-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {trades.map((t) => {
              const pnl = t.pnl ?? 0;
              const isPositive = pnl >= 0;
              return (
                <tr key={t.id} className="hover:bg-slate-850/40">
                  <td className="py-3 font-bold text-slate-200">
                    {t.asset} <span className="text-cyan-400 text-[10px]">LONG</span>
                  </td>
                  <td className="py-3 text-slate-300">{t.positionSize}</td>
                  <td className="py-3 text-slate-300">${t.entryPrice.toLocaleString()}</td>
                  <td className="py-3 text-rose-400">${t.stopLoss.toLocaleString()}</td>
                  <td className="py-3 text-emerald-400">${t.takeProfit.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      t.status === "OPEN"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {t.status === "CLOSED" ? (
                      <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                        {isPositive ? "+" : ""}${pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-500">Unrealized</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {t.status === "OPEN" && onCloseTrade ? (
                      <button
                        onClick={() => onCloseTrade(t.id)}
                        className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20"
                      >
                        Close
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[11px]">Settled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
