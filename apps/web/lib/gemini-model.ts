/**
 * Gemini model selection for AI Studio free tier.
 * Keep this list in sync with https://ai.google.dev/gemini-api/docs/models
 */

/** Models retired for new AI Studio keys (must never be the default). */
export const RETIRED_GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
] as const;

/** Stable free-tier Flash-Lite used by AI Studio for high-volume / agentic chat. */
export const DEFAULT_GEMINI_CHAT_MODEL = "gemini-3.5-flash-lite";

export function isRetiredGeminiModel(model: string): boolean {
  const id = model.trim().toLowerCase().replace(/^models\//, "");
  return (RETIRED_GEMINI_MODELS as readonly string[]).includes(id);
}

/**
 * Resolve the chat model from env, rejecting known-retired IDs so we fall back
 * to the current free-tier Flash-Lite default.
 */
export function resolveGeminiChatModel(
  envModel: string | undefined = process.env.GEMINI_MODEL
): string {
  const requested = (envModel || "").trim();
  if (!requested) return DEFAULT_GEMINI_CHAT_MODEL;
  if (isRetiredGeminiModel(requested)) return DEFAULT_GEMINI_CHAT_MODEL;
  return requested;
}
