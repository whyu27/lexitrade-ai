import { NextResponse } from "next/server";
import { getPaperTrades } from "@/lib/db/client";

export async function GET() {
  try {
    const trades = await getPaperTrades();
    return NextResponse.json({
      success: true,
      data: trades,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch paper trades";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
