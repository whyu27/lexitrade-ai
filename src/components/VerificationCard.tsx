"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ExternalLink } from "lucide-react";
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
          icon: CheckCircle2,
          color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          label: "VERIFIED",
          description: "Supported by corroborated source content",
        };
      case "CONFLICTING":
        return {
          icon: XCircle,
          color: "border-rose-500/30 bg-rose-500/10 text-rose-400",
          label: "CONFLICTING",
          description: "Material contradiction identified in source",
        };
      case "UNAVAILABLE":
        return {
          icon: AlertTriangle,
          color: "border-orange-500/30 bg-orange-500/10 text-orange-400",
          label: "UNAVAILABLE",
          description: "Source page could not be accessed or timed out",
        };
      case "UNVERIFIED":
      default:
        return {
          icon: HelpCircle,
          color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
          label: "UNVERIFIED",
          description: "Insufficient source evidence to corroborate claim",
        };
    }
  };

  const badge = getStatusBadge(analysis.verificationStatus);
  const Icon = badge.icon;
  const matchedKeywords = (payload?.matchedKeywords as string[]) || [];
  const conflictingTerms = (payload?.conflictingTerms as string[]) || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          1. News Evidence Verification
        </span>
        <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${badge.color}`}>
          <Icon className="h-3.5 w-3.5" />
          {badge.label}
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <p className="text-slate-300 leading-relaxed font-medium">
          &ldquo;{analysis.claim}&rdquo;
        </p>

        {analysis.sourceUrl ? (
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="text-slate-500">Source:</span>
            <a
              href={analysis.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:underline truncate max-w-xs"
            >
              <span>{newsEvidence?.provider || analysis.sourceUrl}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>
        ) : (
          <div className="text-slate-500 italic">
            No independent source URL provided.
          </div>
        )}

        {payload?.extractedExcerpt ? (
          <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-2.5 text-[11px] text-slate-400">
            <span className="block font-semibold text-slate-300 mb-1">
              Extracted Source Excerpt:
            </span>
            <p className="italic line-clamp-3">&ldquo;{payload.extractedExcerpt as string}&rdquo;</p>
          </div>
        ) : null}

        {matchedKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[11px] text-slate-500">Matched Terms:</span>
            {matchedKeywords.map((term, i) => (
              <span
                key={i}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {conflictingTerms.length > 0 && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-[11px] text-rose-300">
            <span className="font-semibold block mb-0.5">Contradiction Warning:</span>
            {conflictingTerms.join("; ")}
          </div>
        )}
      </div>
    </div>
  );
}
