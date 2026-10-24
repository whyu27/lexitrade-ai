import { z } from "zod";

export const VerificationStatusSchema = z.enum([
  "VERIFIED",
  "UNVERIFIED",
  "CONFLICTING",
  "UNAVAILABLE",
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const SentimentSchema = z.enum([
  "BULLISH",
  "BEARISH",
  "NEUTRAL",
  "UNCERTAIN",
]);
export type Sentiment = z.infer<typeof SentimentSchema>;

export const RegulatoryRiskSchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "UNKNOWN",
]);
export type RegulatoryRisk = z.infer<typeof RegulatoryRiskSchema>;

export const MarketObservationSchema = z.object({
  asset: z.string(),
  price: z.number(),
  observedAt: z.string(),
  retrievedAt: z.string(),
  provider: z.string(),
  metrics: z.record(z.string(), z.union([z.number(), z.string(), z.null()])).optional(),
});
export type MarketObservation = z.infer<typeof MarketObservationSchema>;

export const AnalysisSchema = z.object({
  id: z.string(),
  claim: z.string(),
  sourceUrl: z.string().optional().nullable(),
  createdAt: z.string(),
  verificationStatus: VerificationStatusSchema,
  sentiment: SentimentSchema,
  regulatoryRisk: RegulatoryRiskSchema,
  summary: z.string(),
  uncertaintyNotes: z.array(z.string()),
  affectedAssets: z.array(z.string()).default([]),
  jurisdiction: z.string().optional().nullable(),
  sourceType: z.string().optional().nullable(),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export const EvidenceTypeSchema = z.enum([
  "NEWS_SOURCE",
  "MARKET_OBSERVATION",
  "OTHER",
]);
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;

export const EvidenceSchema = z.object({
  id: z.string(),
  analysisId: z.string(),
  type: EvidenceTypeSchema,
  provider: z.string(),
  sourceUrl: z.string().optional().nullable(),
  observedAt: z.string().optional().nullable(),
  retrievedAt: z.string(),
  payload: z.record(z.string(), z.unknown()),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const RuleResultSchema = z.object({
  ruleId: z.string(),
  passed: z.boolean(),
  explanation: z.string(),
});
export type RuleResult = z.infer<typeof RuleResultSchema>;

export const DecisionOutcomeSchema = z.enum(["BUY", "NO_TRADE"]);
export type DecisionOutcome = z.infer<typeof DecisionOutcomeSchema>;

export const DecisionSchema = z.object({
  id: z.string(),
  analysisId: z.string(),
  strategyVersion: z.string(),
  outcome: DecisionOutcomeSchema,
  evaluatedAt: z.string(),
  evidenceIds: z.array(z.string()),
  ruleResults: z.array(RuleResultSchema),
  rejectionReasons: z.array(z.string()),
});
export type Decision = z.infer<typeof DecisionSchema>;

export const TradeStatusSchema = z.enum(["OPEN", "CLOSED", "CANCELLED"]);
export type TradeStatus = z.infer<typeof TradeStatusSchema>;

export const PaperTradeSchema = z.object({
  id: z.string(),
  decisionId: z.string(),
  asset: z.string(),
  direction: z.literal("LONG"),
  entryPrice: z.number(),
  positionSize: z.number(),
  stopLoss: z.number(),
  takeProfit: z.number(),
  openedAt: z.string(),
  closedAt: z.string().optional().nullable(),
  exitPrice: z.number().optional().nullable(),
  pnl: z.number().optional().nullable(),
  status: TradeStatusSchema,
});
export type PaperTrade = z.infer<typeof PaperTradeSchema>;

// API Request/Response Schemas
export const AnalyzeRequestSchema = z.object({
  claim: z.string().min(5, "Claim must be at least 5 characters"),
  sourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  targetAsset: z.string().default("BTC"),
});
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const CloseTradeRequestSchema = z.object({
  tradeId: z.string().min(1, "Trade ID is required"),
  exitPrice: z.number().positive("Exit price must be positive").optional(),
});
export type CloseTradeRequest = z.infer<typeof CloseTradeRequestSchema>;
