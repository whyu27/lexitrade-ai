"use client";

import React from "react";
import { ExternalLink, Check, X, AlertTriangle, HelpCircle } from "lucide-react";
import type { Analysis, Evidence } from "@/lib/schemas";

interface VerificationCardProps {
  analysis: Analysis;
  evidences: Evidence[];
}

export function VerificationCard({ analysis, evidences }: VerificationCardProps) {
  const newsEvidence = evidences.find((e) => e.type === "NEWS_SOURCE");
  const payload = newsEvidence?.payload as Record<string, unknown> | undefined;

  const getStatusBadge = (status: Analysis["verificationStatus"]) => {
    switch (status) {
      case "VERIFIED":
        return {
          color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
          symbol: "● VERIFIED",
        };
      case "CONFLICTING":
        return {
          color: "border-rose-500/40 bg-rose-500/10 text-rose-400",
          symbol: "✕ CONFLICTING",
        };
      case "UNAVAILABLE":
        return {
          color: "border-orange-500/40 bg-orange-500/10 text-orange-400",
          symbol: "▲ UNAVAILABLE",
        };
      case "UNVERIFIED":
      default:
        return {
          color: "border-amber-500/40 bg-amber-500/10 text-amber-400",
          symbol: "■ UNVERIFIED",
        };
    }
  };

  const badge = getStatusBadge(analysis.verificationStatus);
  const matchedKeywords = (payload?.matchedKeywords as string[]) || [];
  const conflictingTerms = (payload?.conflictingTerms as string[]) || [];

  return (
    <div className="rounded border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs">
      <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
        <span className="font-semibold text-zinc-300">
          [SOURCE VERIFICATION AUDIT]
        </span>
        <span className={`rounded border px-2 py-0.5 text-[11px] font-bold ${badge.color}`}>
          {badge.symbol}
        </span>
      </div>

      <div className="space-y-2.5 font-sans">
        <div>
          <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-0.5">
            Claim Under Evaluation:
          </span>
          <p className="text-zinc-200 text-xs leading-relaxed">
            &ldquo;{analysis.claim}&rdquo;
          </p>
        </div>

        <div className="font-mono text-[11px] text-zinc-400">
          <span className="text-zinc-500">SOURCE: </span>
          {analysis.sourceUrl ? (
            <a
              href={analysis.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-zinc-300 hover:text-white underline underline-offset-2"
            >
              <span>{newsEvidence?.provider || analysis.sourceUrl}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-zinc-500 italic">None provided (Self-reported claim)</span>
          )}
        </div>

        {payload?.extractedExcerpt ? (
          <div className="rounded border border-zinc-800 bg-zinc-950/70 p-2 text-[11px] font-mono text-zinc-400">
            <span className="text-zinc-500 block text-[10px] mb-1">
              EXTRACTED PROOF EXCERPT:
            </span>
            <p className="line-clamp-3 text-zinc-300 italic">
              &ldquo;{payload.extractedExcerpt as string}&rdquo;
            </p>
          </div>
        ) : null}

        {matchedKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1 font-mono text-[10px]">
            <span className="text-zinc-500">CORROBORATED TOKENS:</span>
            {matchedKeywords.map((term, i) => (
              <span
                key={i}
                className="rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.2 text-emerald-400"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {conflictingTerms.length > 0 && (
          <div className="rounded border border-rose-900/50 bg-rose-950/20 p-2 font-mono text-[11px] text-rose-300">
            <span className="font-bold block text-rose-400 mb-0.5">
              CONTRADICTION DETECTED:
            </span>
            {conflictingTerms.join("; ")}
          </div>
        )}
      </div>
    </div>
  );
}
