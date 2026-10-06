import { describe, expect, it } from "vitest";
import { asDbUserId } from "../apps/web/lib/db-user-id";

describe("asDbUserId", () => {
  it("keeps UUID strings intact", () => {
    const uuid = "33a8cc45-6d48-4983-b787-8ff8c50bd97a";
    expect(asDbUserId(uuid)).toBe(uuid);
  });

  it("rejects Number(uuid) style NaN values", () => {
    const uuid = "33a8cc45-6d48-4983-b787-8ff8c50bd97a";
    expect(Number(uuid)).toBeNaN();
    expect(() => asDbUserId(Number(uuid))).toThrow(/invalid database user id/);
  });

  it("rejects nullish ids", () => {
    expect(() => asDbUserId(null)).toThrow(/missing database user id/);
    expect(() => asDbUserId(undefined)).toThrow(/missing database user id/);
  });
});
