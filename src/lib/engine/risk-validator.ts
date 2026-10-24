import type {
  StrategyConfig,
  RiskValidationResult,
  ProposedTradeParameters,
} from "./types";
import { DEFAULT_STRATEGY_CONFIG } from "./types";

export class RiskValidator {
  private config: StrategyConfig;

  constructor(config: Partial<StrategyConfig> = {}) {
    this.config = { ...DEFAULT_STRATEGY_CONFIG, ...config };
  }

  validateAndCalculate(
    asset: string,
    currentPrice: number
  ): RiskValidationResult {
    if (!currentPrice || isNaN(currentPrice) || currentPrice <= 0 || !isFinite(currentPrice)) {
      return {
        valid: false,
        rejectionReason: `Invalid market price for risk calculation: ${currentPrice}`,
      };
    }

    if (this.config.virtualPortfolioBalance <= 0) {
      return {
        valid: false,
        rejectionReason: `Portfolio balance must be positive: ${this.config.virtualPortfolioBalance}`,
      };
    }

    if (this.config.maxPositionPercent <= 0 || this.config.maxPositionPercent > 100) {
      return {
        valid: false,
        rejectionReason: `Max position percentage must be between 1% and 100%: ${this.config.maxPositionPercent}`,
      };
    }

    const positionSizeUsd = (this.config.maxPositionPercent / 100) * this.config.virtualPortfolioBalance;
    const positionSizeUnits = Number((positionSizeUsd / currentPrice).toFixed(6));

    const stopLoss = Number((currentPrice * (1 - this.config.stopLossPercent / 100)).toFixed(4));
    const takeProfit = Number((currentPrice * (1 + this.config.takeProfitPercent / 100)).toFixed(4));

    if (stopLoss >= currentPrice || stopLoss <= 0) {
      return {
        valid: false,
        rejectionReason: `Stop-loss (${stopLoss}) must be positive and strictly below entry price (${currentPrice})`,
      };
    }

    if (takeProfit <= currentPrice) {
      return {
        valid: false,
        rejectionReason: `Take-profit (${takeProfit}) must be strictly above entry price (${currentPrice})`,
      };
    }

    const potentialLossPerUnit = currentPrice - stopLoss;
    const potentialGainPerUnit = takeProfit - currentPrice;
    const riskRewardRatio = Number((potentialGainPerUnit / potentialLossPerUnit).toFixed(2));

    const proposedTrade: ProposedTradeParameters = {
      asset: asset.toUpperCase(),
      entryPrice: currentPrice,
      positionSize: positionSizeUnits,
      positionSizeUsd,
      stopLoss,
      takeProfit,
      riskRewardRatio,
    };

    return {
      valid: true,
      proposedTrade,
    };
  }
}
