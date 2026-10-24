import type { PaperTrade } from "../schemas";
import type { ProposedTradeParameters } from "../engine/types";
import {
  savePaperTrade,
  updatePaperTrade,
  getPaperTrades,
  getDb,
  initDb,
} from "../db/client";

export class PaperTradingEngine {
  createTradeFromDecision(
    decisionId: string,
    params: ProposedTradeParameters
  ): PaperTrade {
    const tradeId = `pt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const openedAt = new Date().toISOString();

    const trade: PaperTrade = {
      id: tradeId,
      decisionId,
      asset: params.asset,
      direction: "LONG",
      entryPrice: params.entryPrice,
      positionSize: params.positionSize,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
      openedAt,
      status: "OPEN",
    };

    return trade;
  }

  evaluateExit(
    trade: PaperTrade,
    currentPrice: number
  ): {
    shouldClose: boolean;
    reason?: "STOP_LOSS_HIT" | "TAKE_PROFIT_HIT";
    exitPrice?: number;
    pnl?: number;
  } {
    if (trade.status !== "OPEN") {
      return { shouldClose: false };
    }

    if (currentPrice <= trade.stopLoss) {
      const exitPrice = currentPrice;
      const pnl = Number(((exitPrice - trade.entryPrice) * trade.positionSize).toFixed(2));
      return {
        shouldClose: true,
        reason: "STOP_LOSS_HIT",
        exitPrice,
        pnl,
      };
    }

    if (currentPrice >= trade.takeProfit) {
      const exitPrice = currentPrice;
      const pnl = Number(((exitPrice - trade.entryPrice) * trade.positionSize).toFixed(2));
      return {
        shouldClose: true,
        reason: "TAKE_PROFIT_HIT",
        exitPrice,
        pnl,
      };
    }

    return { shouldClose: false };
  }

  async closeTrade(
    tradeId: string,
    exitPrice: number,
    status: "CLOSED" | "CANCELLED" = "CLOSED"
  ): Promise<PaperTrade> {
    await initDb();
    const db = getDb();

    const res = await db.execute({
      sql: "SELECT * FROM paper_trades WHERE id = ?",
      args: [tradeId],
    });

    if (res.rows.length === 0) {
      throw new Error(`Trade ${tradeId} not found`);
    }

    const row = res.rows[0];
    const entryPrice = Number(row.entry_price);
    const positionSize = Number(row.position_size);
    const closedAt = new Date().toISOString();
    const pnl = Number(((exitPrice - entryPrice) * positionSize).toFixed(2));

    await updatePaperTrade({
      id: tradeId,
      closedAt,
      exitPrice,
      pnl,
      status,
    });

    return {
      id: tradeId,
      decisionId: row.decision_id as string,
      asset: row.asset as string,
      direction: "LONG",
      entryPrice,
      positionSize,
      stopLoss: Number(row.stop_loss),
      takeProfit: Number(row.take_profit),
      openedAt: row.opened_at as string,
      closedAt,
      exitPrice,
      pnl,
      status,
    };
  }
}

let defaultPaperEngine: PaperTradingEngine | null = null;
export function getPaperTradingEngine(): PaperTradingEngine {
  if (!defaultPaperEngine) {
    defaultPaperEngine = new PaperTradingEngine();
  }
  return defaultPaperEngine;
}
