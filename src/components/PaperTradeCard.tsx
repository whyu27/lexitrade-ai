"use client";

import React, { useState } from "react";
import { DollarSign, Shield, Target, ArrowUpRight, CheckCircle2, Lock } from "lucide-react";
import type { PaperTrade } from "@/lib/schemas";

interface PaperTradeCardProps {
  trade: PaperTrade;
  onCloseTrade?: (tradeId: string) => Promise<void>;
}

export function PaperTradeCard({ trade, onCloseTrade }: PaperTradeCardProps) {
  const [isClosing, setIsClosing] = useState(false);
  const isOpen = trade.status === "OPEN";

  const handleClose = async () => {
    if (!onCloseTrade || !isOpen) return;
    try {
      setIsClosing(true);
      await onCloseTrade(trade.id);
    } finally {
      setIsClosing(false);
    }
  };

  const pnl = trade.pnl ?? 0;
  const isPnlPositive = pnl >= 0;

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/40 to-slate-950 p-5 shadow-xl backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            5. Simulated Practice Trade (Paper Execution)
          </span>
          <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
            {trade.direction} {trade.asset}
          </span>
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
          isOpen
            ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 animate-pulse"
            : "border-slate-700 bg-slate-800 text-slate-400"
        }`}>
          {trade.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs mb-4">
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Entry Price</span>
          <p className="text-base font-bold font-mono text-slate-100">
            ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">Executed at live spot</span>
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-2.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Position Size</span>
          <p className="text-base font-bold font-mono text-slate-100">
            {trade.positionSize} {trade.asset}
          </p>
          <span className="text-[10px] text-slate-400">
            ~${Math.round(trade.positionSize * trade.entryPrice).toLocaleString()} USD
          </span>
        </div>

        <div className="rounded-xl border border-rose-900/30 bg-slate-950/70 p-2.5">
          <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 uppercase">
            <Shield className="h-3 w-3" /> Stop-Loss (-3%)
          </span>
          <p className="text-base font-bold font-mono text-rose-400">
            ${trade.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">Automated Exit Floor</span>
        </div>

        <div className="rounded-xl border border-emerald-900/30 bg-slate-950/70 p-2.5">
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 uppercase">
            <Target className="h-3 w-3" /> Take-Profit (+6%)
          </span>
          <p className="text-base font-bold font-mono text-emerald-400">
            ${trade.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-500">Target Exit Ceiling</span>
        </div>
      </div>

      {/* Outcome / Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Audit Ref:</span>
            <span className="font-mono text-slate-300">{trade.id}</span>
          </div>

          {!isOpen && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Realized PnL:</span>
              <span className={`font-mono font-bold ${isPnlPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {isPnlPositive ? "+" : ""}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {isOpen && onCloseTrade && (
          <button
            type="button"
            onClick={handleClose}
            disabled={isClosing}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
          >
            {isClosing ? (
              <span>Closing Position...</span>
            ) : (
              <>
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Close Position (Simulated Market Fill)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
