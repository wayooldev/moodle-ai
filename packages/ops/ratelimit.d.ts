export type FailPolicy = "open" | "closed";

export type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending?: Promise<unknown>;
  error?: unknown;
};

export function buildRateLimitKey(opts: {
  userId?: string;
  clientId?: string;
  ip?: string;
}): string;

export function createLimiter(opts: {
  prefix: string;
  limit?: number;
  window?: `${number} s` | `${number} m` | `${number} h`;
  failPolicy?: FailPolicy;
}): {
  failPolicy: FailPolicy;
  limit: (identifier: string) => Promise<LimitResult>;
};

export function writeLimiter(): ReturnType<typeof createLimiter>;
export function chatLimiter(): ReturnType<typeof createLimiter>;
export function mcpLimiter(): ReturnType<typeof createLimiter>;
export function clientIp(req: {
  headers?: Record<string, unknown>;
  get?: (name: string) => string | undefined;
  ip?: string;
  socket?: { remoteAddress?: string };
}): string;
export function rateLimitHeaders(result: LimitResult): Record<string, string>;
export function __resetMemoryBuckets(): void;
