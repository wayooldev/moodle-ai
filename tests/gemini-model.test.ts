import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_GEMINI_CHAT_MODEL,
  RETIRED_GEMINI_MODELS,
  isRetiredGeminiModel,
  resolveGeminiChatModel,
} from "../apps/web/lib/gemini-model";

describe("resolveGeminiChatModel", () => {
  afterEach(() => {
    delete process.env.GEMINI_MODEL;
  });

  it("defaults to free-tier flash-lite", () => {
    expect(resolveGeminiChatModel(undefined)).toBe("gemini-3.5-flash-lite");
    expect(DEFAULT_GEMINI_CHAT_MODEL).toBe("gemini-3.5-flash-lite");
  });

  it("honors a valid GEMINI_MODEL override", () => {
    expect(resolveGeminiChatModel("gemini-flash-lite-latest")).toBe(
      "gemini-flash-lite-latest"
    );
  });

  it("rejects retired models so new AI Studio keys keep working", () => {
    for (const retired of RETIRED_GEMINI_MODELS) {
      expect(isRetiredGeminiModel(retired)).toBe(true);
      expect(resolveGeminiChatModel(retired)).toBe(DEFAULT_GEMINI_CHAT_MODEL);
    }
  });

  it("chat route uses resolveGeminiChatModel and does not hardcode retired defaults", () => {
    const source = readFileSync(
      path.resolve("apps/web/app/api/chat/route.ts"),
      "utf8"
    );
    expect(source).toMatch(/resolveGeminiChatModel/);
    expect(source).toMatch(/from "@\/lib\/gemini-model"/);
    // Hardcoding retired IDs as the model argument must not regress.
    expect(source).not.toMatch(/google\(\s*["']gemini-2\.0-flash["']\s*\)/);
    expect(source).not.toMatch(
      /GOOGLE_GENERATIVE_AI.*?gemini-2\.0-flash|gemini-2\.0-flash.*?GOOGLE_GENERATIVE/
    );
    expect(source).not.toMatch(
      /process\.env\.GEMINI_MODEL\s*\|\|\s*["']gemini-2\./
    );
  });
});
