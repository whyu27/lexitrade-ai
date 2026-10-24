import { NextRequest, NextResponse } from "next/server";
import { getAnalysisById } from "@/lib/db/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing analysis ID" },
        { status: 400 }
      );
    }

    const record = await getAnalysisById(id);
    if (!record.analysis) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch analysis details";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
