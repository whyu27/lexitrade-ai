import { NextResponse } from "next/server";
import { getAnalyses } from "@/lib/db/client";
import { seedInitialDemoData } from "@/lib/db/seed";

export async function GET() {
  try {
    let list = await getAnalyses();
    if (list.length === 0) {
      await seedInitialDemoData();
      list = await getAnalyses();
    }
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
