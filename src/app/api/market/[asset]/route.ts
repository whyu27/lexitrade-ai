import { NextRequest, NextResponse } from "next/server";
import { getMarketDataService, StaleMarketDataError } from "@/lib/market";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asset: string }> }
) {
  try {
    const { asset } = await params;
    if (!asset || asset.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Asset parameter is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxAgeSec = searchParams.get("maxAgeSec")
      ? parseInt(searchParams.get("maxAgeSec")!, 10)
      : undefined;
    const allowStale = searchParams.get("allowStale") === "true";

    const service = getMarketDataService();
    const observation = await service.getMarketObservation(asset, {
      maxAgeSec,
      allowStale,
    });

    return NextResponse.json({
      success: true,
      data: observation,
    });
  } catch (err: unknown) {
    if (err instanceof StaleMarketDataError) {
      return NextResponse.json(
        { success: false, error: err.message, code: "STALE_DATA" },
        { status: 422 }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
