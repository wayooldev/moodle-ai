import { describe, expect, it } from "vitest";
import { loadMcpEnv, mcpEnvSchema } from "../apps/mcp/src/env.js";

describe("MCP env schema", () => {
  const valid = {
    DATABASE_URL: "postgres://user:pass@localhost:5432/db",
    TOKEN_ENCRYPTION_KEY: "0123456789abcdef",
    MCP_API_KEY: "test-key",
    PORT: "3000",
  };

  it("accepts valid env", () => {
    const env = loadMcpEnv(valid);
    expect(env.PORT).toBe(3000);
    expect(env.MCP_API_KEY).toBe("test-key");
  });

  it("rejects missing TOKEN_ENCRYPTION_KEY", () => {
    const { TOKEN_ENCRYPTION_KEY: _, ...rest } = valid;
    expect(() => loadMcpEnv(rest)).toThrow();
  });

  it("exposes schema for fixtures", () => {
    expect(mcpEnvSchema.safeParse(valid).success).toBe(true);
  });
});
