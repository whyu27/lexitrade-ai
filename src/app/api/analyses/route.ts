import { NextResponse } from "next/server";
import { getAnalyses } from "@/lib/db/client";

export async function GET() {
  try {
    const list = await getAnalyses();
    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch analyses";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
