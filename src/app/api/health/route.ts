import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db/client";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const dbCheck = await db.execute("SELECT 1 as alive");
    const isDbAlive = dbCheck.rows.length > 0;

    return NextResponse.json({
      status: "ok",
      service: "LexiTrade AI API",
      timestamp: new Date().toISOString(),
      database: isDbAlive ? "connected" : "error",
      version: "0.1.0",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        status: "error",
        service: "LexiTrade AI API",
        timestamp: new Date().toISOString(),
        error: message,
      },
      { status: 500 }
    );
  }
}
