import { NextRequest, NextResponse } from "next/server";
import { getPaperTradingEngine } from "@/lib/paper-trading/paper-trading-engine";
import { getMarketDataService } from "@/lib/market";
import { getDb, initDb } from "@/lib/db/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tradeId } = await params;
    if (!tradeId) {
      return NextResponse.json(
        { success: false, error: "Missing trade ID" },
        { status: 400 }
      );
    }

    let bodyExitPrice: number | undefined;
    try {
      const body = await request.json();
      if (typeof body.exitPrice === "number" && body.exitPrice > 0) {
        bodyExitPrice = body.exitPrice;
      }
    } catch {
      // Body is optional
    }

    let finalExitPrice = bodyExitPrice;

    if (!finalExitPrice) {
      await initDb();
      const db = getDb();
      const res = await db.execute({
        sql: "SELECT asset, status FROM paper_trades WHERE id = ?",
        args: [tradeId],
      });

      if (res.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: `Trade ${tradeId} not found` },
          { status: 404 }
        );
      }

      const { asset, status } = res.rows[0];
      if (status !== "OPEN") {
        return NextResponse.json(
          { success: false, error: `Trade ${tradeId} is already ${status}` },
          { status: 400 }
        );
      }

      const marketService = getMarketDataService();
      const obs = await marketService.getMarketObservation(asset as string, {
        allowStale: true,
      });
      finalExitPrice = obs.price;
    }

    const paperEngine = getPaperTradingEngine();
    const closedTrade = await paperEngine.closeTrade(tradeId, finalExitPrice);

    return NextResponse.json({
      success: true,
      data: closedTrade,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to close trade";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
