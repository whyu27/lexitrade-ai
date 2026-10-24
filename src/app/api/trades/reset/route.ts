import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db/client";

export async function POST() {
  try {
    await initDb();
    const db = getDb();
    await db.execute("DELETE FROM paper_trades;");

    return NextResponse.json({
      success: true,
      message: "Simulation portfolio reset to $100,000 starting cash",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reset portfolio";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
