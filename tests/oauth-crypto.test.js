import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  sha256Hex,
  verifyPkceS256,
  safeEqual,
} from "../apps/mcp/src/crypto.js";

describe("MCP OAuth crypto helpers", () => {
  it("sha256Hex is stable", () => {
    expect(sha256Hex("abc")).toBe(
      createHash("sha256").update("abc").digest("hex")
    );
  });

  it("verifyPkceS256 accepts matching challenge", () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    expect(verifyPkceS256(verifier, challenge)).toBe(true);
  });

  it("verifyPkceS256 rejects mismatch", () => {
    expect(verifyPkceS256("verifier-a", "challenge-b")).toBe(false);
  });

  it("safeEqual compares equal strings", () => {
    expect(safeEqual("same", "same")).toBe(true);
    expect(safeEqual("a", "b")).toBe(false);
  });
});
