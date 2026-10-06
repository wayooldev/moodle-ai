import { describe, expect, it } from "vitest";
import { scrubSentryEvent, scrubObject, REDACTED } from "../packages/ops/scrub.js";

describe("Sentry scrubber", () => {
  it("redacts sensitive headers", () => {
    const event = scrubSentryEvent({
      request: {
        headers: {
          authorization: "Bearer super-secret",
          "x-api-key": "mcp-key",
          "content-type": "application/json",
        },
        data: { wstoken: "tok", moodleUrl: "https://example.com" },
      },
    });
    expect(event.request.headers.authorization).toBe(REDACTED);
    expect(event.request.headers["x-api-key"]).toBe(REDACTED);
    expect(event.request.headers["content-type"]).toBe("application/json");
    expect(event.request.data.wstoken).toBe(REDACTED);
    expect(event.request.data.moodleUrl).toBe("https://example.com");
  });

  it("scrubs nested objects", () => {
    const out = scrubObject({ password: "x", nested: { client_secret: "y" } });
    expect(out.password).toBe(REDACTED);
    expect(out.nested.client_secret).toBe(REDACTED);
  });
});
