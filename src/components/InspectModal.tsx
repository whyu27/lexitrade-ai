"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldCheck, Database, FileText, CheckCircle2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-8 w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Auditable Record Inspection
              </h3>
              <p className="font-mono text-[11px] text-slate-500">ID: {analysisId}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="mt-2 text-xs text-slate-400">Loading persistent evidence trail...</p>
          </div>
        ) : data ? (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <VerificationCard analysis={data.analysis} evidences={data.evidences} />
            <RegulatoryCard analysis={data.analysis} />
            {data.decision && <DecisionCard decision={data.decision} />}
            {data.paperTrade && <PaperTradeCard trade={data.paperTrade} />}
          </div>
        ) : (
          <p className="py-8 text-center text-xs text-slate-400">Record not found.</p>
        )}
      </div>
    </div>
  );
}
