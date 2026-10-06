import { describe, expect, it, beforeEach } from "vitest";
import {
  buildRateLimitKey,
  createLimiter,
  __resetMemoryBuckets,
} from "../packages/ops/ratelimit.js";

describe("rate limit helpers", () => {
  beforeEach(() => {
    __resetMemoryBuckets();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("prefers userId then clientId then ip", () => {
    expect(buildRateLimitKey({ userId: "u1", clientId: "c1", ip: "1.1.1.1" })).toBe(
      "user:u1"
    );
    expect(buildRateLimitKey({ clientId: "c1", ip: "1.1.1.1" })).toBe("client:c1");
    expect(buildRateLimitKey({ ip: "1.1.1.1" })).toBe("ip:1.1.1.1");
  });

  it("returns 429 after exceeding memory limit (fail-closed writes)", async () => {
    const limiter = createLimiter({
      prefix: "test-write",
      limit: 2,
      window: "1 m",
      failPolicy: "closed",
    });
    expect((await limiter.limit("u")).success).toBe(true);
    expect((await limiter.limit("u")).success).toBe(true);
    expect((await limiter.limit("u")).success).toBe(false);
  });
});
