import { describe, expect, it, beforeAll } from "vitest";
import { encryptSecret, decryptSecret } from "../packages/db/crypto.js";

beforeAll(() => {
  process.env.TOKEN_ENCRYPTION_KEY =
    process.env.TOKEN_ENCRYPTION_KEY ||
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
});

describe("packages/db crypto", () => {
  it("roundtrips plaintext", () => {
    const { ciphertext, nonce } = encryptSecret("wstoken-secret-value");
    expect(decryptSecret(ciphertext, nonce)).toBe("wstoken-secret-value");
  });

  it("rejects tampered ciphertext", () => {
    const { ciphertext, nonce } = encryptSecret("hello");
    const buf = Buffer.from(ciphertext, "base64");
    buf[0] ^= 0xff;
    expect(() => decryptSecret(buf.toString("base64"), nonce)).toThrow();
  });
});
