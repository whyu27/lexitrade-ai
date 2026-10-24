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
