import { NextResponse } from "next/server";
import { verifyAuditLedgerIntegrity } from "@/lib/db/client";

export async function GET() {
  try {
    const result = await verifyAuditLedgerIntegrity();
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        algorithm: "SHA-256 Hash Chaining",
        status: result.valid ? "CRYPTOGRAPHICALLY_VERIFIED" : "CHAIN_INTEGRITY_VIOLATION",
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify audit ledger integrity";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
