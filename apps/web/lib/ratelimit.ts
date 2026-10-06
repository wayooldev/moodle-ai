import {
  buildRateLimitKey,
  chatLimiter,
  clientIp,
  rateLimitHeaders,
  writeLimiter,
} from "@moodle-ai/ops/ratelimit";
import { NextResponse } from "next/server";

const write = writeLimiter();
const chat = chatLimiter();

export async function enforceWriteRateLimit(
  req: Request,
  userId?: string | null
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const key = buildRateLimitKey({ userId: userId || undefined, ip });
  const result = await write.limit(key);
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(result) }
    );
  }
  return null;
}

export async function enforceChatRateLimit(
  req: Request,
  userId?: string | null
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const key = buildRateLimitKey({ userId: userId || undefined, ip });
  const result = await chat.limit(key);
  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(result) }
    );
  }
  return null;
}

export { buildRateLimitKey, clientIp, rateLimitHeaders };
