"use client";

import React from "react";
import { Database, FileText } from "lucide-react";
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
      <div className="rounded border border-zinc-800 bg-zinc-900/40 p-8 text-center font-mono text-xs text-zinc-500">
        <Database className="mx-auto h-6 w-6 text-zinc-600 mb-2" />
        <p>NO AUDIT RECORDS FOUND IN DATABASE</p>
        <p className="text-[11px] text-zinc-600 mt-1">Submit a claim to generate an auditable record trail.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-semibold text-zinc-200">
          [PERMANENT COMPLIANCE & DECISION LEDGER]
        </span>
        <span className="text-[11px] text-zinc-500">
          COUNT: {analyses.length} ENTRIES
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
              <th className="pb-2 w-36">Timestamp (UTC)</th>
              <th className="pb-2 w-16">Asset</th>
              <th className="pb-2 w-28">Status</th>
              <th className="pb-2 w-24">Sentiment</th>
              <th className="pb-2">Claim Headline</th>
              <th className="pb-2 text-right w-20">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {analyses.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectAnalysis(item.id)}
                className="hover:bg-zinc-850/40 cursor-pointer"
              >
                <td className="py-2.5 text-zinc-400">
                  {new Date(item.createdAt).toISOString().replace("T", " ").substring(0, 19)}
                </td>
                <td className="py-2.5 font-bold text-zinc-200">
                  {item.affectedAssets.join(",") || "BTC"}
                </td>
                <td className="py-2.5">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[10px] font-bold border ${
                      item.verificationStatus === "VERIFIED"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : item.verificationStatus === "CONFLICTING"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {item.verificationStatus}
                  </span>
                </td>
                <td className="py-2.5 text-zinc-300">
                  {item.sentiment}
                </td>
                <td className="py-2.5 text-zinc-300 font-sans text-xs truncate max-w-md pr-4">
                  {item.claim}
                </td>
                <td className="py-2.5 text-right">
                  <button
                    type="button"
                    className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 hover:text-white"
                  >
                    INSPECT
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
      <div className="rounded border border-zinc-800 bg-zinc-900/40 p-8 text-center font-mono text-xs text-zinc-500">
        <FileText className="mx-auto h-6 w-6 text-zinc-600 mb-2" />
        <p>NO SIMULATED POSITIONS OPENED</p>
        <p className="text-[11px] text-zinc-600 mt-1">
          Positions are triggered only when verified evidence passes all 6 deterministic rules.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-semibold text-zinc-200">
          [SIMULATED PRACTICE POSITIONS LEDGER]
        </span>
        <span className="text-[11px] text-zinc-500">
          COUNT: {trades.length} POSITIONS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
              <th className="pb-2">Position Ref</th>
              <th className="pb-2">Instrument</th>
              <th className="pb-2">Size</th>
              <th className="pb-2">Entry Price</th>
              <th className="pb-2">Stop-Loss</th>
              <th className="pb-2">Take-Profit</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Realized PnL</th>
              <th className="pb-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {trades.map((t) => {
              const pnl = t.pnl ?? 0;
              const isPositive = pnl >= 0;
              return (
                <tr key={t.id} className="hover:bg-zinc-850/40">
                  <td className="py-2.5 text-zinc-400 font-mono text-[10px]">
                    {t.id}
                  </td>
                  <td className="py-2.5 font-bold text-zinc-200">
                    {t.direction} {t.asset}
                  </td>
                  <td className="py-2.5 text-zinc-300">{t.positionSize}</td>
                  <td className="py-2.5 text-zinc-300">${t.entryPrice.toLocaleString()}</td>
                  <td className="py-2.5 text-rose-400">${t.stopLoss.toLocaleString()}</td>
                  <td className="py-2.5 text-emerald-400">${t.takeProfit.toLocaleString()}</td>
                  <td className="py-2.5">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold border ${
                        t.status === "OPEN"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold">
                    {t.status === "CLOSED" ? (
                      <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                        {isPositive ? "+" : ""}${pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-normal">UNREALIZED</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    {t.status === "OPEN" && onCloseTrade ? (
                      <button
                        onClick={() => onCloseTrade(t.id)}
                        className="rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                      >
                        CLOSE
                      </button>
                    ) : (
                      <span className="text-zinc-600 text-[10px]">SETTLED</span>
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
