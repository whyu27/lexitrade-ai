"use client";

import React from "react";
import { Check, X, ShieldAlert, Cpu } from "lucide-react";
import type { Decision } from "@/lib/schemas";

interface DecisionCardProps {
  decision: Decision;
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const isBuy = decision.outcome === "BUY";

  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-sm transition-all ${
      isBuy
        ? "border-emerald-500/40 bg-emerald-950/20 shadow-xl shadow-emerald-500/10"
        : "border-amber-500/40 bg-amber-950/20 shadow-xl shadow-amber-500/10"
    }`}>
      {/* Header Verdict */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            4. Deterministic Decision Engine
          </span>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            {decision.strategyVersion}
          </span>
        </div>

        <div className={`flex items-center gap-2 rounded-xl px-4 py-1.5 font-bold tracking-wider text-sm shadow-md ${
          isBuy
            ? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-300"
            : "border border-amber-400/40 bg-amber-500/20 text-amber-300"
        }`}>
          {isBuy ? (
            <>
              <Check className="h-4 w-4 stroke-[3]" />
              <span>DECISION: BUY</span>
            </>
          ) : (
            <>
              <X className="h-4 w-4 stroke-[3]" />
              <span>DECISION: NO TRADE</span>
            </>
          )}
        </div>
      </div>

      {/* Rejection Alert if NO_TRADE */}
      {!isBuy && decision.rejectionReasons.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1">
            <ShieldAlert className="h-4 w-4" />
            <span>Trading Execution Disallowed — Safety Constraints Triggered:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-amber-300/90 pl-1">
            {decision.rejectionReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6 Rules Checklist */}
      <div>
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Rule Verification Checklist:
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {decision.ruleResults.map((rule) => (
            <div
              key={rule.ruleId}
              className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-xs transition-all ${
                rule.passed
                  ? "border-emerald-500/20 bg-emerald-950/20 text-slate-200"
                  : "border-slate-800 bg-slate-950/60 text-slate-400"
              }`}
            >
              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                rule.passed
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}>
                {rule.passed ? (
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                ) : (
                  <X className="h-2.5 w-2.5 stroke-[3]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-mono text-[10px] font-semibold block text-slate-300">
                  {rule.ruleId}
                </span>
                <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                  {rule.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
