---
linear_story_id: "33a8cc45-6d48-4983-b787-8ff8c50bd97a"
linear_story_identifier: "WAY-148"
linear_story_title: "[MAI] Product shell: landing, onboarding, dashboard y chat Gemini"
linear_story_url: "https://linear.app/wayool/issue/WAY-148/mai-product-shell-landing-onboarding-dashboard-y-chat-gemini"
linear_story_state: "Todo"
linear_team: "Wayool"
linear_project: "moodle-ai"
linear_label: "MAI"
---

## Why

moodle-ai ya autentica con Clerk y guarda el wstoken, pero la web no se siente producto: landing mínima, URL de escuela hardcodeada, dashboard = formulario, y el valor del MCP (cursos/tareas/calendario + asistente) no aparece en la UI. Hay que convertir la web en el hogar del campus conectado, con chat Gemini (tier gratuito) seguro y observable.

## What Changes

- Landing profesional (tipografía, motion, CTA Clerk) con Tailwind + shadcn + Framer Motion.
- Onboarding obligatorio de campus (URL placeholder genérico + wstoken + prueba de conexión); Settings en header.
- Dashboard: site info, cursos, tareas, calendario con filtros (alimentado por tools Moodle/MCP).
- Extender MCP/cliente Moodle con eventos de calendario y datos de tareas normalizados.
- Chat (opción C) con Gemini Flash gratuito (AI Studio), rate limit, defensa anti prompt-injection, Langfuse (sin secretos/wstoken en traces).
- Guard post-login: sin credencial → `/onboarding`.

## Capabilities

### New Capabilities

- `marketing-landing`: landing de producto con CTA de sign-in.
- `campus-onboarding`: primer setup URL+token y settings posteriores.
- `lms-dashboard`: cursos, tareas, calendario y filtros.
- `moodle-mcp-surface`: tools MCP/calendario alineadas al dashboard.
- `campus-chat-agent`: chat Gemini + tools Moodle con seguridad y Langfuse.

### Modified Capabilities

Ninguna canónica previa fuera del tooling.

## Impact

`apps/web` (UI, routes, APIs), `apps/mcp` (tools calendar), `packages/*` si aplica, env (`GOOGLE_GENERATIVE_AI_API_KEY`, Langfuse), dependencias Tailwind/shadcn/framer/`ai`/`@ai-sdk/google`/`langfuse`.

Negocio: [WAY-148](https://linear.app/wayool/issue/WAY-148/mai-product-shell-landing-onboarding-dashboard-y-chat-gemini).
