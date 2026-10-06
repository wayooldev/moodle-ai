declare module "@moodle-ai/db" {
  export function getPool(): unknown;
  export function query(
    text: string,
    params?: unknown[]
  ): Promise<{ rows: Record<string, unknown>[] }>;
}

declare module "@moodle-ai/db/crypto" {
  export function encryptSecret(plaintext: string): {
    ciphertext: string;
    nonce: string;
  };
  export function decryptSecret(ciphertextB64: string, nonceB64: string): string;
}

declare module "@moodle-ai/ops/scrub" {
  export const REDACTED: string;
  export function scrubObject(input: unknown): unknown;
  export function scrubSentryEvent<T>(event: T): T;
}

declare module "@moodle-ai/ops/ratelimit" {
  export function buildRateLimitKey(input: {
    userId?: string;
    clientId?: string;
    ip?: string;
  }): string;
  export function createLimiter(opts: {
    prefix: string;
    limit?: number;
    window?: string;
    failPolicy?: "open" | "closed";
  }): {
    failPolicy: "open" | "closed";
    limit: (identifier: string) => Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
    }>;
  };
  export function writeLimiter(): ReturnType<typeof createLimiter>;
  export function chatLimiter(): ReturnType<typeof createLimiter>;
  export function mcpLimiter(): ReturnType<typeof createLimiter>;
  export function clientIp(req: unknown): string;
  export function rateLimitHeaders(result: {
    limit: number;
    remaining: number;
    reset: number;
  }): Record<string, string>;
  export function __resetMemoryBuckets(): void;
}

declare module "@moodle-ai/moodle" {
  export type MoodleClient = {
    getSiteInfo: () => Promise<Record<string, any>>;
    getEnrolledCourses: (userid: number) => Promise<any>;
    getCourseContents: (courseid: number) => Promise<any>;
    getUserAssignments: (courseids: number[]) => Promise<any>;
    getAssignmentsNormalized: (courseids: number[]) => Promise<any[]>;
    getCalendarEvents: (opts?: {
      timestart?: number;
      timeend?: number;
    }) => Promise<{ events: any[]; source: string }>;
    testConnection: () => Promise<{
      sitename: string | null;
      username: string | null;
      userid: number | null;
      release: string | null;
    }>;
  };
  export function createMoodleClient(overrides?: {
    baseUrl?: string;
    token?: string;
  }): MoodleClient;
  export function normalizeAssignments(raw: unknown): any[];
  export function normalizeCalendarEvents(raw: unknown): any[];
}
