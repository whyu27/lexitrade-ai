"use client";

import React from "react";
import { Check, X, ShieldAlert } from "lucide-react";
import type { Decision } from "@/lib/schemas";

interface DecisionCardProps {
  decision: Decision;
}

export function DecisionCard({ decision }: DecisionCardProps) {
  const isBuy = decision.outcome === "BUY";

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs">
      {/* Header & Grand Verdict */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-300">
            [DETERMINISTIC COMPLIANCE MATRIX]
          </span>
          <span className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.2 text-[10px] text-zinc-400">
            STRATEGY: {decision.strategyVersion}
          </span>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded border px-3 py-1 font-bold text-xs tracking-wider ${
            isBuy
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
              : "border-rose-500/50 bg-rose-500/10 text-rose-400"
          }`}
        >
          {isBuy ? (
            <>
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>OUTCOME: ELIGIBLE BUY</span>
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5 stroke-[3]" />
              <span>OUTCOME: NO TRADE (REJECTED)</span>
            </>
          )}
        </div>
      </div>

      {/* Safety Violation Banner if NO_TRADE */}
      {!isBuy && decision.rejectionReasons.length > 0 && (
        <div className="mb-3 rounded border border-rose-900/40 bg-rose-950/20 p-2.5 text-xs text-rose-300">
          <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>EXECUTION BLOCKED BY AUDIT POLICY:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-300/90 pl-1 font-sans text-[11px]">
            {decision.rejectionReasons.map((reason, idx) => (
              <li key={idx} className="leading-snug">{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 6 Rules Verification Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px]">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase">
              <th className="pb-1.5 w-48">Rule Code</th>
              <th className="pb-1.5">Evaluated Audit Finding</th>
              <th className="pb-1.5 text-right w-20">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {decision.ruleResults.map((rule) => (
              <tr key={rule.ruleId} className="hover:bg-zinc-850/30">
                <td className="py-2 font-semibold text-zinc-300">
                  {rule.ruleId}
                </td>
                <td className="py-2 text-zinc-400 font-sans text-xs pr-4">
                  {rule.explanation}
                </td>
                <td className="py-2 text-right">
                  <span
                    className={`inline-block rounded px-1.5 py-0.2 font-mono text-[10px] font-bold border ${
                      rule.passed
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {rule.passed ? "PASS" : "FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
