import { createHash } from "crypto";

export const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Deterministically sorts object keys and serializes to JSON string
 * to guarantee cryptographic hash reproducibility.
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== "object") {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map((item) => canonicalJson(item)).join(",")}]`;
  }
  const keys = Object.keys(obj).sort();
  const pairs = keys.map((key) => {
    const value = (obj as Record<string, unknown>)[key];
    return `${JSON.stringify(key)}:${canonicalJson(value)}`;
  });
  return `{${pairs.join(",")}}`;
}

/**
 * Computes a standard SHA-256 hash for any arbitrary audit record payload,
 * cryptographically binding it to the previous record's hash (hash chaining).
 */
export function computeRecordHash(payload: Record<string, unknown>, prevHash: string = GENESIS_HASH): string {
  const canonicalData = canonicalJson(payload);
  const input = `${prevHash}:${canonicalData}`;
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Verifies that a given record's computed hash matches its recorded hash
 * given its payload and predecessor hash.
 */
export function verifyRecordHash(
  payload: Record<string, unknown>,
  recordedHash: string,
  prevHash: string = GENESIS_HASH
): boolean {
  const computed = computeRecordHash(payload, prevHash);
  return computed.toLowerCase() === recordedHash.toLowerCase();
}
