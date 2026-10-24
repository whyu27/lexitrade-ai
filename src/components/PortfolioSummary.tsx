"use client";

import React from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Activity, RotateCcw } from "lucide-react";
import type { PaperTrade } from "@/lib/schemas";

interface PortfolioSummaryProps {
  trades: PaperTrade[];
  livePrices?: Record<string, number>;
  onResetPortfolio?: () => Promise<void>;
}

const STARTING_BALANCE = 100000;

export function PortfolioSummary({
  trades,
  livePrices = {},
  onResetPortfolio,
}: PortfolioSummaryProps) {
  // 1. Calculate Realized PnL from closed trades
  const closedTrades = trades.filter((t) => t.status === "CLOSED");
  const realizedPnL = closedTrades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.pnl ?? 0) > 0).length;
  const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

  // 2. Calculate Active Positions and Allocated Capital
  const openTrades = trades.filter((t) => t.status === "OPEN");
  const allocatedCapital = openTrades.reduce(
    (acc, t) => acc + t.positionSize * t.entryPrice,
    0
  );

  // 3. Calculate Live Unrealized PnL from open trades
  const unrealizedPnL = openTrades.reduce((acc, t) => {
    const currentPrice = livePrices[t.asset] || t.entryPrice;
    const diff = currentPrice - t.entryPrice;
    return acc + diff * t.positionSize;
  }, 0);

  // 4. Balances
  const availableCash = STARTING_BALANCE - allocatedCapital + realizedPnL;
  const totalEquity = STARTING_BALANCE + realizedPnL + unrealizedPnL;
  const totalReturnPercent = ((totalEquity - STARTING_BALANCE) / STARTING_BALANCE) * 100;

  const isEquityPositive = totalEquity >= STARTING_BALANCE;
  const isRealizedPositive = realizedPnL >= 0;
  const isUnrealizedPositive = unrealizedPnL >= 0;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/50 p-3 font-mono text-xs">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 items-center">
        {/* Metric 1: Total Portfolio Equity */}
        <div className="border-r border-zinc-800/80 pr-2">
          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
            Total Net Equity
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-zinc-100">
              ${totalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span
            className={`text-[10px] font-semibold ${
              isEquityPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isEquityPositive ? "+" : ""}
            {totalReturnPercent.toFixed(2)}% All-Time
          </span>
        </div>

        {/* Metric 2: Available Buying Power / Cash */}
        <div className="border-r border-zinc-800/80 pr-2">
          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
            Available Cash
          </span>
          <p className="text-sm font-bold text-zinc-200 mt-0.5">
            ${Math.max(0, availableCash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-500">Unallocated Reserves</span>
        </div>

        {/* Metric 3: Capital in Positions */}
        <div className="border-r border-zinc-800/80 pr-2">
          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
            Active Capital
          </span>
          <p className="text-sm font-bold text-cyan-400 mt-0.5">
            ${allocatedCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-zinc-500">
            {openTrades.length} Active {openTrades.length === 1 ? "Position" : "Positions"}
          </span>
        </div>

        {/* Metric 4: Floating & Realized PnL */}
        <div className="border-r border-zinc-800/80 pr-2">
          <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
            P&L Breakdown
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-zinc-400">Float:</span>
            <span
              className={`font-bold ${
                isUnrealizedPositive ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {isUnrealizedPositive ? "+" : ""}${unrealizedPnL.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className="text-zinc-500">Realized:</span>
            <span
              className={isRealizedPositive ? "text-emerald-400" : "text-rose-400"}
            >
              {isRealizedPositive ? "+" : ""}${realizedPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Metric 5: Win Rate & Portfolio Reset */}
        <div className="flex flex-col justify-between h-full col-span-2 sm:col-span-1">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase block tracking-wider">
              Win Rate
            </span>
            <p className="text-sm font-bold text-zinc-200 mt-0.5">
              {closedTrades.length > 0 ? `${winRate.toFixed(0)}%` : "N/A"}
              <span className="text-[10px] font-normal text-zinc-500 ml-1">
                ({winningTrades}/{closedTrades.length})
              </span>
            </p>
          </div>

          {onResetPortfolio && (
            <button
              type="button"
              onClick={onResetPortfolio}
              className="mt-1 flex items-center justify-center gap-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-[10px] text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Reset Portfolio</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
