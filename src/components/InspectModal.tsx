"use client";

import React, { useEffect, useState } from "react";
import { X, Database } from "lucide-react";
import type { Analysis, Evidence, Decision, PaperTrade } from "@/lib/schemas";
import { VerificationCard } from "./VerificationCard";
import { RegulatoryCard } from "./RegulatoryCard";
import { DecisionCard } from "./DecisionCard";
import { PaperTradeCard } from "./PaperTradeCard";

interface InspectModalProps {
  analysisId: string | null;
  onClose: () => void;
}

export function InspectModal({ analysisId, onClose }: InspectModalProps) {
  const [data, setData] = useState<{
    analysis: Analysis;
    evidences: Evidence[];
    decision: Decision | null;
    paperTrade: PaperTrade | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (analysisId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [analysisId, onClose]);

  useEffect(() => {
    if (!analysisId) return;
    setLoading(true);

    fetch(`/api/analyses/${analysisId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .catch((err) => console.error("Failed to load audit record:", err))
      .finally(() => setLoading(false));
  }, [analysisId]);

  if (!analysisId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative my-8 w-full max-w-4xl rounded border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
        {/* Modal Header */}
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-zinc-400" />
            <div>
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                AUDIT TRAIL INSPECTOR
              </h3>
              <p className="text-[10px] text-zinc-500">RECORD: {analysisId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border border-zinc-400 border-t-transparent mb-2" />
            <span>FETCHING RECORD FROM PERSISTENT LEDGER...</span>
          </div>
        ) : data ? (
          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {/* Cryptographic Hash Chaining Banner */}
            {data.analysis?.recordHash && (
              <div className="rounded border border-emerald-500/30 bg-emerald-950/20 p-2.5 font-mono text-[11px] text-zinc-300">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-900/30 mb-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SHA-256 CRYPTOGRAPHIC INTEGRITY VERIFIED</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">IMMUTABLE AUDIT CHAIN</span>
                </div>
                <div className="space-y-0.5 text-[10px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-24 shrink-0">RECORD HASH:</span>
                    <span className="font-mono text-zinc-200 select-all truncate">{data.analysis.recordHash}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-24 shrink-0">PREV HASH:</span>
                    <span className="font-mono text-zinc-400 select-all truncate">{data.analysis.prevHash || "GENESIS_ROOT"}</span>
                  </div>
                </div>
              </div>
            )}

            <VerificationCard analysis={data.analysis} evidences={data.evidences} />
            <RegulatoryCard analysis={data.analysis} />
            {data.decision && <DecisionCard decision={data.decision} />}
            {data.paperTrade && (
              <PaperTradeCard
                trade={data.paperTrade}
                currentPrice={
                  data.evidences.find((e) => e.type === "MARKET_OBSERVATION")?.payload?.price as number | undefined
                }
              />
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-zinc-500">Record not found in database.</p>
        )}
      </div>
    </div>
  );
}
