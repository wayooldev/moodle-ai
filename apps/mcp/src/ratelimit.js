import {
  buildRateLimitKey,
  clientIp,
  mcpLimiter,
  rateLimitHeaders,
  writeLimiter,
} from "@moodle-ai/ops/ratelimit";

const tokenLimiter = writeLimiter();
const entryLimiter = mcpLimiter();

export async function enforceTokenRateLimit(req, res, clientId) {
  const key = buildRateLimitKey({
    clientId: clientId || undefined,
    ip: clientIp(req),
  });
  const result = await tokenLimiter.limit(key);
  if (!result.success) {
    res.set(rateLimitHeaders(result));
    res.status(429).json({ error: "too_many_requests" });
    return false;
  }
  return true;
}

/** Express middleware — use after requireMcpAuth so req.auth is set. */
export function rateLimitMcpEntry() {
  return async (req, res, next) => {
    try {
      const userId = req.auth?.userId || null;
      const apiKey = req.get("x-api-key") || req.query?.api_key;
      const key = buildRateLimitKey({
        userId,
        clientId: typeof apiKey === "string" ? `key:${apiKey.slice(0, 8)}` : undefined,
        ip: clientIp(req),
      });
      const result = await entryLimiter.limit(key);
      if (!result.success) {
        res.set(rateLimitHeaders(result));
        res.status(429).json({ error: "Too many requests" });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
