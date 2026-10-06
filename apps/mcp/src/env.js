import { z } from "zod";

const mcpEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  TOKEN_ENCRYPTION_KEY: z.string().min(16),
  MCP_API_KEY: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_BASE_URL: z.string().url().optional(),
  WEB_APP_URL: z.string().url().optional(),
  MOODLE_URL: z.string().url().optional(),
  MOODLE_TOKEN: z.string().optional(),
  INTERNAL_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

/**
 * Validate MCP process env at boot. Throws ZodError on failure.
 * @param {NodeJS.ProcessEnv} [source]
 */
export function loadMcpEnv(source = process.env) {
  return mcpEnvSchema.parse({
    DATABASE_URL: source.DATABASE_URL,
    TOKEN_ENCRYPTION_KEY: source.TOKEN_ENCRYPTION_KEY,
    MCP_API_KEY: source.MCP_API_KEY,
    PORT: source.PORT,
    PUBLIC_BASE_URL: source.PUBLIC_BASE_URL,
    WEB_APP_URL: source.WEB_APP_URL,
    MOODLE_URL: source.MOODLE_URL,
    MOODLE_TOKEN: source.MOODLE_TOKEN,
    INTERNAL_API_KEY: source.INTERNAL_API_KEY,
    SENTRY_DSN: source.SENTRY_DSN,
    UPSTASH_REDIS_REST_URL: source.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: source.UPSTASH_REDIS_REST_TOKEN,
  });
}

export { mcpEnvSchema };
