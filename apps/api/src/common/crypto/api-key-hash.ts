import { createHash, timingSafeEqual } from "crypto";

/** Deterministic hash for storing / comparing API keys (pepper from env). */
export function hashApiKey(rawKey: string, pepper: string): string {
  return createHash("sha256").update(`${pepper}:${rawKey}`, "utf8").digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}
