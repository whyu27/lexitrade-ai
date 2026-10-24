import { describe, it, expect } from "vitest";
import { RiskValidator } from "../src/lib/engine/risk-validator";
import { PaperTradingEngine } from "../src/lib/paper-trading/paper-trading-engine";
import type { PaperTrade } from "../src/lib/schemas";

describe("Phase 5 — Paper Trading Engine & Risk Validator", () => {
  const riskValidator = new RiskValidator({
    virtualPortfolioBalance: 100000,
    maxPositionPercent: 10,
    stopLossPercent: 3.0,
    takeProfitPercent: 6.0,
  });

  const paperEngine = new PaperTradingEngine();

  it("should calculate correct position size, stop-loss, and take-profit", () => {
    const entryPrice = 80000;
    const res = riskValidator.validateAndCalculate("BTC", entryPrice);

    expect(res.valid).toBe(true);
    expect(res.proposedTrade).toBeDefined();

    // 10% of 100,000 = $10,000
    expect(res.proposedTrade?.positionSizeUsd).toBe(10000);
    // 10,000 / 80,000 = 0.125 BTC
    expect(res.proposedTrade?.positionSize).toBe(0.125);
    // 3% below 80,000 = 77,600
    expect(res.proposedTrade?.stopLoss).toBe(77600);
    // 6% above 80,000 = 84,800
    expect(res.proposedTrade?.takeProfit).toBe(84800);
    // 2:1 R/R ratio
    expect(res.proposedTrade?.riskRewardRatio).toBe(2);
  });

  it("should create a simulated PaperTrade object from decision parameters", () => {
    const trade = paperEngine.createTradeFromDecision("dec-123", {
      asset: "BTC",
      entryPrice: 80000,
      positionSize: 0.125,
      positionSizeUsd: 10000,
      stopLoss: 77600,
      takeProfit: 84800,
      riskRewardRatio: 2,
    });

    expect(trade.id).toBeDefined();
    expect(trade.decisionId).toBe("dec-123");
    expect(trade.status).toBe("OPEN");
    expect(trade.direction).toBe("LONG");
    expect(trade.entryPrice).toBe(80000);
    expect(trade.stopLoss).toBe(77600);
    expect(trade.takeProfit).toBe(84800);
  });

  it("should trigger exit when price drops to or below stop-loss", () => {
    const trade: PaperTrade = {
      id: "pt-1",
      decisionId: "dec-1",
      asset: "BTC",
      direction: "LONG",
      entryPrice: 80000,
      positionSize: 1,
      stopLoss: 77600,
      takeProfit: 84800,
      openedAt: new Date().toISOString(),
      status: "OPEN",
    };

    const exitCheck = paperEngine.evaluateExit(trade, 77500); // Hit stop-loss
    expect(exitCheck.shouldClose).toBe(true);
    expect(exitCheck.reason).toBe("STOP_LOSS_HIT");
    expect(exitCheck.exitPrice).toBe(77500);
    expect(exitCheck.pnl).toBe(-2500);
  });

  it("should trigger exit when price rises to or above take-profit", () => {
    const trade: PaperTrade = {
      id: "pt-2",
      decisionId: "dec-2",
      asset: "BTC",
      direction: "LONG",
      entryPrice: 80000,
      positionSize: 1,
      stopLoss: 77600,
      takeProfit: 84800,
      openedAt: new Date().toISOString(),
      status: "OPEN",
    };

    const exitCheck = paperEngine.evaluateExit(trade, 85000); // Hit take-profit
    expect(exitCheck.shouldClose).toBe(true);
    expect(exitCheck.reason).toBe("TAKE_PROFIT_HIT");
    expect(exitCheck.exitPrice).toBe(85000);
    expect(exitCheck.pnl).toBe(5000);
  });

  it("should not trigger exit while price remains between stop-loss and take-profit", () => {
    const trade: PaperTrade = {
      id: "pt-3",
      decisionId: "dec-3",
      asset: "BTC",
      direction: "LONG",
      entryPrice: 80000,
      positionSize: 1,
      stopLoss: 77600,
      takeProfit: 84800,
      openedAt: new Date().toISOString(),
      status: "OPEN",
    };

    const exitCheck = paperEngine.evaluateExit(trade, 81000);
    expect(exitCheck.shouldClose).toBe(false);
  });
});
