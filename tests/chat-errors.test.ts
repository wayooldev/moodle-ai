import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { chatFetch, friendlyChatError } from "../apps/web/lib/chat-errors";

describe("friendlyChatError", () => {
  it("maps missing API key to Spanish", () => {
    const r = friendlyChatError(
      503,
      "GOOGLE_GENERATIVE_AI_API_KEY is not configured"
    );
    expect(r.message).toMatch(/asistente no está configurado/i);
    expect(r.detail).toMatch(/GOOGLE_GENERATIVE_AI/);
    expect(r.message).not.toMatch(/An error occurred/i);
  });

  it("maps campus not connected", () => {
    const r = friendlyChatError(404, "Campus not connected");
    expect(r.message).toMatch(/campus conectado/i);
  });

  it("maps retired Gemini model 404 to Spanish (not generic English)", () => {
    const r = friendlyChatError(
      404,
      'This model models/gemini-2.0-flash is no longer available. Please update your code to use models/gemini-3.5-flash-lite'
    );
    expect(r.message).toMatch(/modelo de IA|no está disponible/i);
    expect(r.message).not.toMatch(/An error occurred/i);
    expect(r.message).not.toMatch(/campus conectado/i);
    expect(r.detail).toMatch(/gemini-2\.0-flash/);
  });

  it("maps unauthorized and rate limit", () => {
    expect(friendlyChatError(401, "Unauthorized").message).toMatch(/sesión/i);
    expect(friendlyChatError(429, "quota exceeded").message).toMatch(
      /demasiadas solicitudes/i
    );
  });

  it("never surfaces the AI SDK generic English string as the friendly message", () => {
    const r = friendlyChatError(500, "An error occurred.");
    expect(r.message).toMatch(/español|reintentar|detalle técnico|completar/i);
    expect(r.message).not.toBe("An error occurred.");
  });
});

describe("chatFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("throws Spanish Error with detail from JSON error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error:
              "This model models/gemini-2.0-flash is no longer available",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    await expect(chatFetch("/api/chat", { method: "POST" })).rejects.toMatchObject(
      {
        message: expect.stringMatching(/modelo de IA|no está disponible/i),
        detail: expect.stringMatching(/gemini-2\.0-flash/),
      }
    );
  });

  it("throws Spanish Error on network failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    );

    await expect(chatFetch("/api/chat")).rejects.toMatchObject({
      message: expect.stringMatching(/conexión|red/i),
      detail: expect.stringMatching(/Failed to fetch/i),
    });
  });

  it("passes through successful responses", async () => {
    const ok = new Response("ok", { status: 200 });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ok)
    );
    await expect(chatFetch("/api/chat")).resolves.toBe(ok);
  });
});

describe("campus chat error UX source guards", () => {
  it("uses chatFetch and exposes technical detail controls", () => {
    const source = readFileSync(
      path.resolve("apps/web/components/campus-chat.tsx"),
      "utf8"
    );
    expect(source).toMatch(/chatFetch/);
    expect(source).toMatch(/Ver detalle técnico/);
    expect(source).toMatch(/Pensando/);
    expect(source).not.toMatch(/>An error occurred/);
  });
});
