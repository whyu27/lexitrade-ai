"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
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
    <div className="rounded border border-zinc-700 bg-zinc-900/60 p-4 font-mono text-xs">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-200">
            [PRACTICE ORDER TICKET]
          </span>
          <span className="text-zinc-500 text-[11px]">
            REF: {trade.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
            {trade.direction} {trade.asset}
          </span>
          <span
            className={`rounded border px-2 py-0.5 text-[10px] font-bold ${
              isOpen
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-400"
            }`}
          >
            {trade.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
        <div className="rounded border border-zinc-800 bg-zinc-950 p-2">
          <span className="text-[10px] text-zinc-500 block uppercase">Entry Fill</span>
          <span className="text-xs font-bold text-zinc-200">
            ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950 p-2">
          <span className="text-[10px] text-zinc-500 block uppercase">Position Size</span>
          <span className="text-xs font-bold text-zinc-200">
            {trade.positionSize} {trade.asset}
          </span>
          <span className="text-[10px] text-zinc-500 block">
            ~${Math.round(trade.positionSize * trade.entryPrice).toLocaleString()}
          </span>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950 p-2">
          <span className="text-[10px] text-rose-400 block uppercase">Stop-Loss (-3%)</span>
          <span className="text-xs font-bold text-rose-400">
            ${trade.stopLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="rounded border border-zinc-800 bg-zinc-950 p-2">
          <span className="text-[10px] text-emerald-400 block uppercase">Take-Profit (+6%)</span>
          <span className="text-xs font-bold text-emerald-400">
            ${trade.takeProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-2 text-[11px]">
        <div>
          {!isOpen && (
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">REALIZED P&L:</span>
              <span
                className={`font-bold ${
                  isPnlPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPnlPositive ? "+" : ""}${pnl.toFixed(2)} USD
              </span>
            </div>
          )}
          {isOpen && (
            <span className="text-zinc-500 text-[10px]">
              Active practice trade • Stop-loss & take-profit monitored against feed
            </span>
          )}
        </div>

        {isOpen && onCloseTrade && (
          <button
            type="button"
            onClick={handleClose}
            disabled={isClosing}
            className="flex items-center gap-1.5 rounded border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            {isClosing ? (
              <span>CLOSING ORDER...</span>
            ) : (
              <>
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>CLOSE POSITION (MARKET EXIT)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
