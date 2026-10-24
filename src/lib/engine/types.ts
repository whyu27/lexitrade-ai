import type { RegulatoryRisk } from "../schemas";

export interface StrategyConfig {
  version: string;
  name: string;
  maxMarketDataAgeSec: number;
  maxAllowed24hDropPercent: number;
  allowedRegulatoryRisks: RegulatoryRisk[];
  maxPositionPercent: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  virtualPortfolioBalance: number;
}

export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  version: "v1.0.0",
  name: "Regulatory Momentum Long-Only",
  maxMarketDataAgeSec: 300,             // 5 minutes
  maxAllowed24hDropPercent: -5.0,       // Max acceptable 24h drop is -5%
  allowedRegulatoryRisks: ["LOW", "MEDIUM"],
  maxPositionPercent: 10,               // 10% of portfolio ($10,000 on $100,000 balance)
  stopLossPercent: 3.0,                 // 3% stop loss
  takeProfitPercent: 6.0,               // 6% take profit (2:1 R/R ratio)
  virtualPortfolioBalance: 100000,      // $100,000 starting virtual balance
};

export interface ProposedTradeParameters {
  asset: string;
  entryPrice: number;
  positionSize: number;       // In asset units (e.g. 0.12 BTC)
  positionSizeUsd: number;    // In virtual USD (e.g. $10,000)
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
}

export interface RiskValidationResult {
  valid: boolean;
  rejectionReason?: string;
  proposedTrade?: ProposedTradeParameters;
}
