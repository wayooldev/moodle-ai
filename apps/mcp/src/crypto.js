import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export { encryptSecret, decryptSecret } from "@moodle-ai/db/crypto";

export function sha256Hex(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function verifyPkceS256(codeVerifier, codeChallenge) {
  const computed = createHash("sha256").update(codeVerifier).digest("base64url");
  return safeEqual(computed, codeChallenge);
}
