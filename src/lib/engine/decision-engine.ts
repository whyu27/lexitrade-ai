import type {
  Analysis,
  Evidence,
  MarketObservation,
  Decision,
  RuleResult,
} from "../schemas";
import {
  StrategyConfig,
  DEFAULT_STRATEGY_CONFIG,
  ProposedTradeParameters,
} from "./types";
import { RiskValidator } from "./risk-validator";

export interface EngineDecisionResult {
  decision: Decision;
  proposedTrade?: ProposedTradeParameters;
}

export class DecisionEngine {
  private config: StrategyConfig;
  private riskValidator: RiskValidator;

  constructor(config: Partial<StrategyConfig> = {}) {
    this.config = { ...DEFAULT_STRATEGY_CONFIG, ...config };
    this.riskValidator = new RiskValidator(this.config);
  }

  evaluate(
    analysis: Analysis,
    evidences: Evidence[],
    marketObservation: MarketObservation | null
  ): EngineDecisionResult {
    const evaluatedAt = new Date().toISOString();
    const decisionId = `dec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ruleResults: RuleResult[] = [];
    const rejectionReasons: string[] = [];

    // Rule 1: News Verification
    const isVerified = analysis.verificationStatus === "VERIFIED";
    const ruleNews: RuleResult = {
      ruleId: "RULE_VERIFIED_NEWS",
      passed: isVerified,
      explanation: isVerified
        ? `Claim is supported by corroborated source evidence (Status: VERIFIED).`
        : `Claim verification status is "${analysis.verificationStatus}". Strategy strictly requires VERIFIED status to avoid trading on rumors or uncorroborated claims.`,
    };
    ruleResults.push(ruleNews);
    if (!ruleNews.passed) {
      rejectionReasons.push(ruleNews.explanation);
    }

    // Rule 2: Bullish Regulatory Sentiment
    const isBullish = analysis.sentiment === "BULLISH";
    const ruleSentiment: RuleResult = {
      ruleId: "RULE_BULLISH_SENTIMENT",
      passed: isBullish,
      explanation: isBullish
        ? `Regulatory analysis confirms positive directional momentum (Sentiment: BULLISH).`
        : `Regulatory sentiment is "${analysis.sentiment}". Strategy requires BULLISH sentiment for simulated long positions.`,
    };
    ruleResults.push(ruleSentiment);
    if (!ruleSentiment.passed) {
      rejectionReasons.push(ruleSentiment.explanation);
    }

    // Rule 3: Regulatory Risk Tolerance
    const isRiskAcceptable = this.config.allowedRegulatoryRisks.includes(
      analysis.regulatoryRisk
    );
    const ruleRisk: RuleResult = {
      ruleId: "RULE_ACCEPTABLE_REGULATORY_RISK",
      passed: isRiskAcceptable,
      explanation: isRiskAcceptable
        ? `Regulatory risk level is "${analysis.regulatoryRisk}", within permitted policy (${this.config.allowedRegulatoryRisks.join(", ")}).`
        : `Regulatory risk level is "${analysis.regulatoryRisk}". Violates risk tolerance limit (${this.config.allowedRegulatoryRisks.join(", ")}).`,
    };
    ruleResults.push(ruleRisk);
    if (!ruleRisk.passed) {
      rejectionReasons.push(ruleRisk.explanation);
    }

    // Rule 4: Valid & Fresh Market Evidence
    let isMarketValid = false;
    let marketRuleExplanation = "";

    if (!marketObservation || !marketObservation.price || marketObservation.price <= 0) {
      marketRuleExplanation = "Missing or invalid market price observation from data provider.";
    } else {
      const observedTime = new Date(marketObservation.observedAt).getTime();
      const ageSec = (Date.now() - observedTime) / 1000;

      if (ageSec > this.config.maxMarketDataAgeSec) {
        marketRuleExplanation = `Market observation is stale (${Math.round(ageSec)}s old, max allowed: ${this.config.maxMarketDataAgeSec}s).`;
      } else {
        isMarketValid = true;
        marketRuleExplanation = `Live market price ($${marketObservation.price.toLocaleString()}) from ${marketObservation.provider} is verified and fresh (${Math.round(ageSec)}s old).`;
      }
    }

    const ruleMarket: RuleResult = {
      ruleId: "RULE_VALID_MARKET_EVIDENCE",
      passed: isMarketValid,
      explanation: marketRuleExplanation,
    };
    ruleResults.push(ruleMarket);
    if (!ruleMarket.passed) {
      rejectionReasons.push(ruleMarket.explanation);
    }

    // Rule 5: Market Trend Stability (Counter-trend check)
    let isTrendAcceptable = true;
    let trendExplanation = "Market trend is within normal volatility parameters.";

    if (marketObservation?.metrics?.priceChangePercent !== undefined) {
      const change24h = Number(marketObservation.metrics.priceChangePercent);
      if (change24h < this.config.maxAllowed24hDropPercent) {
        isTrendAcceptable = false;
        trendExplanation = `Asset 24h price change is ${change24h}%, below the stability threshold of ${this.config.maxAllowed24hDropPercent}%. Severe downward momentum contradicts bullish entry.`;
      } else {
        trendExplanation = `24h price change (${change24h}%) satisfies trend stability threshold (>= ${this.config.maxAllowed24hDropPercent}%).`;
      }
    }

    const ruleTrend: RuleResult = {
      ruleId: "RULE_MARKET_TREND_STABILITY",
      passed: isTrendAcceptable,
      explanation: trendExplanation,
    };
    ruleResults.push(ruleTrend);
    if (!ruleTrend.passed) {
      rejectionReasons.push(ruleTrend.explanation);
    }

    // Rule 6: Risk Limits & Trade Sizing Validation
    let isTradeSizingValid = false;
    let tradeSizingExplanation = "";
    let proposedTrade: ProposedTradeParameters | undefined = undefined;

    if (isMarketValid && marketObservation) {
      const targetAsset = marketObservation.asset;
      const riskCheck = this.riskValidator.validateAndCalculate(
        targetAsset,
        marketObservation.price
      );

      if (riskCheck.valid && riskCheck.proposedTrade) {
        isTradeSizingValid = true;
        proposedTrade = riskCheck.proposedTrade;
        tradeSizingExplanation = `Position sizing approved: ${proposedTrade.positionSize} ${targetAsset} ($${proposedTrade.positionSizeUsd.toLocaleString()}) with Stop-Loss at $${proposedTrade.stopLoss.toLocaleString()} and Take-Profit at $${proposedTrade.takeProfit.toLocaleString()} (R/R: ${proposedTrade.riskRewardRatio}x).`;
      } else {
        tradeSizingExplanation = riskCheck.rejectionReason || "Risk validator rejected trade parameters.";
      }
    } else {
      tradeSizingExplanation = "Cannot validate risk parameters without valid market price evidence.";
    }

    const ruleSizing: RuleResult = {
      ruleId: "RULE_RISK_LIMITS",
      passed: isTradeSizingValid,
      explanation: tradeSizingExplanation,
    };
    ruleResults.push(ruleSizing);
    if (!ruleSizing.passed) {
      rejectionReasons.push(ruleSizing.explanation);
    }

    // Deterministic Outcome
    const allPassed = ruleResults.every((r) => r.passed);
    const outcome = allPassed ? "BUY" : "NO_TRADE";

    const decision: Decision = {
      id: decisionId,
      analysisId: analysis.id,
      strategyVersion: this.config.version,
      outcome,
      evaluatedAt,
      evidenceIds: evidences.map((e) => e.id),
      ruleResults,
      rejectionReasons,
    };

    return {
      decision,
      proposedTrade: outcome === "BUY" ? proposedTrade : undefined,
    };
  }
}

let defaultEngine: DecisionEngine | null = null;
export function getDecisionEngine(): DecisionEngine {
  if (!defaultEngine) {
    defaultEngine = new DecisionEngine();
  }
  return defaultEngine;
}
