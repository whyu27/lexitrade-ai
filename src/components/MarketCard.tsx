"use client";

import React from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { MarketObservation } from "@/lib/schemas";

interface MarketCardProps {
  observation: MarketObservation | null;
  error?: string | null;
  asset: string;
}

export function MarketCard({ observation, error, asset }: MarketCardProps) {
  if (error || !observation) {
    return (
      <div className="rounded border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>MARKET DATA FAILURE: {error || `Unable to fetch quote for ${asset}`}</span>
        </div>
      </div>
    );
  }

  const change24h = Number(observation.metrics?.priceChangePercent ?? 0);
  const isPositive = change24h >= 0;
  const observedDate = new Date(observation.observedAt);
  const ageSec = Math.max(0, Math.round((Date.now() - observedDate.getTime()) / 1000));
  const isFresh = ageSec <= 300;

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Symbol & Price */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm text-zinc-100">{observation.asset}</span>
            <span className="text-[10px] text-zinc-500">/USDT</span>
          </div>

          <div className="text-sm font-bold text-zinc-100">
            ${observation.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          </div>

          <div
            className={`text-xs font-semibold ${
              isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {change24h.toFixed(2)}%
          </div>
        </div>

        {/* 24h High/Low/Volume */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-zinc-400">
          <div>
            <span className="text-zinc-500 mr-1.5">24H VOL:</span>
            <span className="text-zinc-300">
              {Number(observation.metrics?.volume ?? 0).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{" "}
              {observation.asset}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 mr-1.5">SOURCE:</span>
            <span className="text-zinc-300">{observation.provider.toUpperCase()}</span>
          </div>
        </div>

        {/* Freshness & Integrity */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-zinc-500">TIMESTAMP:</span>
          <span className="text-zinc-300">
            {observedDate.toISOString().substring(11, 19)} UTC
          </span>
          <span
            className={`rounded px-1.5 py-0.2 text-[10px] font-semibold border ${
              isFresh
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400"
            }`}
          >
            {isFresh ? `FRESH (${ageSec}s)` : `STALE (${ageSec}s)`}
          </span>
        </div>
      </div>
    </div>
  );
}
