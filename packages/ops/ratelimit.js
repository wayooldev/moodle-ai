import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * @typedef {"open" | "closed"} FailPolicy
 * @typedef {{ success: boolean; limit: number; remaining: number; reset: number; pending?: Promise<unknown> }} LimitResult
 */

const memoryBuckets = new Map();

function memoryLimit(identifier, { limit, windowMs }) {
  const now = Date.now();
  const key = `${identifier}:${limit}:${windowMs}`;
  let bucket = memoryBuckets.get(key);
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + windowMs };
    memoryBuckets.set(key, bucket);
  }
  bucket.count += 1;
  const success = bucket.count <= limit;
  return {
    success,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    reset: bucket.reset,
  };
}

export function buildRateLimitKey({ userId, clientId, ip }) {
  if (userId) return `user:${userId}`;
  if (clientId) return `client:${clientId}`;
  if (ip) return `ip:${ip}`;
  return "ip:unknown";
}

function hasUpstashEnv() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/**
 * @param {{ prefix: string; limit?: number; window?: `${number} s` | `${number} m` | `${number} h`; failPolicy?: FailPolicy }} opts
 */
export function createLimiter(opts) {
  const limit = opts.limit ?? 30;
  const window = opts.window ?? "1 m";
  const failPolicy = opts.failPolicy ?? "closed";
  const windowMs = parseWindowMs(window);

  let upstash = null;
  if (hasUpstashEnv()) {
    upstash = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `moodle-ai:${opts.prefix}`,
      analytics: false,
    });
  }

  return {
    failPolicy,
    async limit(identifier) {
      const id = identifier || "unknown";
      if (!upstash) {
        // Local/CI without Upstash: in-memory sliding approximation.
        return memoryLimit(id, { limit, windowMs });
      }
      try {
        return await upstash.limit(id);
      } catch (err) {
        if (failPolicy === "open") {
          return {
            success: true,
            limit,
            remaining: limit,
            reset: Date.now() + windowMs,
          };
        }
        return {
          success: false,
          limit,
          remaining: 0,
          reset: Date.now() + windowMs,
          error: err,
        };
      }
    },
  };
}

function parseWindowMs(window) {
  const match = /^(\d+)\s*([smh])$/i.exec(String(window).trim());
  if (!match) return 60_000;
  const n = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "s") return n * 1000;
  if (unit === "m") return n * 60_000;
  return n * 3_600_000;
}

/** Write endpoints: OAuth token, credentials, create-code */
export const writeLimiter = () =>
  createLimiter({ prefix: "write", limit: 20, window: "1 m", failPolicy: "closed" });

/** Chat endpoints: Gemini campus agent */
export const chatLimiter = () =>
  createLimiter({ prefix: "chat", limit: 20, window: "1 m", failPolicy: "closed" });

/** MCP entry: slightly higher, fail-open on backend outage for tool listing availability */
export const mcpLimiter = () =>
  createLimiter({ prefix: "mcp", limit: 60, window: "1 m", failPolicy: "open" });

export function clientIp(req) {
  const xf = req.headers?.["x-forwarded-for"] || req.get?.("x-forwarded-for");
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

/** @param {LimitResult} result */
export function rateLimitHeaders(result) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}

/** Reset in-memory buckets (tests only). */
export function __resetMemoryBuckets() {
  memoryBuckets.clear();
}
