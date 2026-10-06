## Context

Web Clerk + BYOK ya existen; MCP expone site/courses/contents/assignments. Falta producto visual, onboarding, superficie LMS y chat. Ver proposal.md — Why. Modelo LLM: `gemini-2.0-flash` vía Google AI Studio (`GOOGLE_GENERATIVE_AI_API_KEY`), tier gratuito alineado al uso Flash de gemini.google.com.

## Goals / Non-Goals

**Goals:** Landing profesional; onboarding/settings campus; dashboard cursos/tareas/calendario; chat Gemini con tools Moodle; rate limit + anti-injection + Langfuse; Tailwind/shadcn/Framer; MCP calendar tools.

**Non-Goals:** Multi-campus org, i18n, billing LLM, agente Alexa redesign, migrar a Prisma.

## Decisions

1. **LLM:** `@ai-sdk/google` + `gemini-2.0-flash` (free tier AI Studio). Alternativa futura: `gemini-2.0-flash-lite` si hay presión de cuota.
2. **Chat tools en servidor:** API Next llama cliente Moodle del user (mismo código que MCP), no proxy HTTP al MCP con API key de servicio.
3. **Langfuse:** traces de chat; nunca wstoken/prompts crudos con PII de Moodle si se puede resumir; scrub secrets.
4. **Prompt injection:** system prompt fijo + tool allowlist + rechazo de intentos de override; rate limit Upstash en `/api/chat`.
5. **UI:** Tailwind + componentes estilo shadcn + Framer Motion en landing/onboarding.
6. **Placeholder URL:** `https://moodle.example.com` (nunca campus real).

## Risks / Trade-offs

- [Cuota Gemini free] → mensaje claro 429; documentar key AI Studio.
- [APIs Moodle varían por sitio] → calendar tool best-effort; fallback a duedates de assign.
- [Langfuse costo/PII] → scrub + no loggear token.

## Migration Plan

1. Deps UI + AI. 2. MCP calendar. 3. APIs Moodle web. 4. Onboarding/guard. 5. Dashboard/chat. 6. Env Vercel.
