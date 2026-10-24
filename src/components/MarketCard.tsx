"use client";

import React from "react";
import { Activity, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import type { MarketObservation } from "@/lib/schemas";

interface MarketCardProps {
  observation: MarketObservation | null;
  error?: string | null;
  asset: string;
}

export function MarketCard({ observation, error, asset }: MarketCardProps) {
  if (error || !observation) {
    return (
      <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-4 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between border-b border-rose-900/50 pb-2">
          <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
            3. Verifiable Market Evidence
          </span>
          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
            DATA ERROR
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <p>{error || `No market observation available for ${asset}.`}</p>
        </div>
      </div>
    );
  }

  const change24h = Number(observation.metrics?.priceChangePercent ?? 0);
  const isPositive = change24h >= 0;
  const observedDate = new Date(observation.observedAt);
  const ageSec = Math.max(0, Math.round((Date.now() - observedDate.getTime()) / 1000));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          3. Verifiable Market Evidence
        </span>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{observation.provider}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Spot Price</span>
          <p className="text-lg font-bold font-mono text-slate-100">
            ${observation.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </p>
          <span className="text-[10px] text-slate-400">{observation.asset}/USDT</span>
        </div>

        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">24h Change</span>
          <p className={`text-lg font-bold font-mono ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPositive ? "+" : ""}{change24h.toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-400">24h Ticker Momentum</span>
        </div>

        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">24h Volume</span>
          <p className="text-sm font-semibold font-mono text-slate-200 mt-1">
            {Number(observation.metrics?.volume ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} {observation.asset}
          </p>
          <span className="text-[10px] text-slate-500">Base Volume</span>
        </div>

        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5">
          <span className="text-[10px] font-medium text-slate-500 uppercase">Freshness</span>
          <div className="flex items-center gap-1 text-sm font-semibold font-mono text-emerald-300 mt-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{ageSec}s ago</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {observedDate.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
