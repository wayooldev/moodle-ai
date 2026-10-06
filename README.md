# Moodle AI

Producto multi-usuario: web (Clerk + BYOK wstoken) + MCP server (Cursor + Alexa+ OAuth 2.1).

## Flujo Git (obligatorio)

```
dev  = trabajo diario (commits / push)
main = producción (solo via PR merge)
```

1. Trabaja siempre en `dev`
2. `git commit` + `git push origin dev`
3. Abre PR `dev` → `main`
4. Al hacer **merge a `main`**:
   - **Vercel** despliega el frontend automáticamente (GitHub integration)
   - **GHCR** construye la imagen MCP (workflow `mcp-ghcr.yml`)

No uses `vercel deploy` CLI para producción. El project Vercel está ligado a `wayooldev/moodle-ai`, root `apps/web`, production branch `main`. Pushes a `dev` generan preview.

## Monorepo

```
apps/web       Next.js → Vercel via GitHub (landing, onboarding, LMS dashboard, chat Gemini, Alexa consent)
apps/mcp       Express MCP + OAuth AS → VPS vía GHCR
packages/db    Postgres helpers + cifrado AES-GCM
packages/moodle Cliente Moodle/Open LMS compartido (site/courses/assignments/calendar)
packages/ops   Scrubber Sentry + rate limit Upstash helpers
```

## Qué ya existe

- Repo GitHub **público**: https://github.com/wayooldev/moodle-ai
- Vercel project **moodle-ai** ligado al repo (deploy en merge a `main`)
- Neon project **moodle-ai** (`dry-river-21739150`) con schema OAuth + credentials
- MCP copiado desde la VPS y extendido:
  - `X-Api-Key` (Cursor) **o** `Authorization: Bearer` (Alexa+)
  - `/.well-known/oauth-authorization-server`
  - `/.well-known/oauth-protected-resource`
  - `/oauth/authorize` → redirect a web consent (Clerk)
  - `/oauth/token` (`client_credentials`, `authorization_code`+PKCE S256, `refresh_token`)
- Workflow `.github/workflows/mcp-ghcr.yml` → `ghcr.io/<owner>/moodle-ai-mcp`

## Setup local

1. Copia `.env.example` → `apps/mcp/.env` y `apps/web/.env.local`
2. Variables clave:
   - `DATABASE_URL` (Neon)
   - `TOKEN_ENCRYPTION_KEY` (string largo o 64 hex)
   - `MCP_API_KEY`, `MOODLE_URL`, `MOODLE_TOKEN` (fallback servicio / Cursor)
   - `PUBLIC_BASE_URL` (MCP público, ej. `https://mcp-lms.wayool.com`)
   - `WEB_APP_URL` / `NEXT_PUBLIC_*` Clerk keys
   - `MCP_BASE_URL`, `INTERNAL_API_KEY` en web (para create-code)
   - Opcional P0: `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - Chat: `GOOGLE_GENERATIVE_AI_API_KEY` (Google AI Studio; modelo free-tier `gemini-3.5-flash-lite`)
   - Observabilidad chat (opcional): `LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_BASE_URL`
3. `npm install` en la raíz
4. Clerk: crea aplicación **moodle-ai** en https://dashboard.clerk.com y pega keys en Vercel Project Settings → Environment Variables (Production + Preview)
5. Seed cliente Alexa (cuando tengas client_id/secret del add-on):

```bash
DATABASE_URL=... node scripts/seed-alexa-client.mjs <client_id> <client_secret> <redirect_uri>
```

## Calidad (lint / tests / e2e)

```bash
npm run lint
npm run typecheck
npm test                 # Vitest (ver tests/README.md)
npm run test:e2e:install # Chromium para Playwright (una vez)
npm run test:e2e:list    # lista Playwright
npm run test:e2e         # requiere secrets E2E_CLERK_* (si faltan, specs hacen skip)
```

CI: `.github/workflows/quality.yml` corre lint, typecheck, Vitest y build web en PRs a `dev`/`main`. El job e2e solo ejecuta browsers si existen secrets `E2E_CLERK_*`; si no, hace `--list` y sale 0.

### Playwright / Clerk

Secrets locales o GitHub Actions:

- `E2E_CLERK_PUBLISHABLE_KEY`, `E2E_CLERK_SECRET_KEY`
- `E2E_CLERK_USER_USERNAME`, `E2E_CLERK_USER_PASSWORD` (usuario de prueba)
- Smoke Alexa consent (opcional, linking aún incompleto): `ALEXA_E2E_SMOKE=1`

Sin esos secrets, los e2e autenticados y el smoke Alexa quedan en **skip** a propósito.

### Secrets de producción (checklist)

| Dónde | Variables |
|---|---|
| Vercel (web) | Clerk, `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY`, `MCP_BASE_URL`, `INTERNAL_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, Langfuse (opc.), `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, Upstash |
| VPS MCP | `DATABASE_URL`, `TOKEN_ENCRYPTION_KEY`, `MCP_API_KEY`, Moodle, `PUBLIC_BASE_URL`, `WEB_APP_URL`, `SENTRY_DSN`, Upstash |
| GitHub Actions | `E2E_CLERK_*` (opcionales para e2e real) |

Nunca commits de `.env` / valores reales.

## Deploy

- **Web:** automático vía GitHub → Vercel al merge a `main` (no CLI).
- **MCP:** push/merge a `main` → GHCR; en VPS `docker compose pull && up -d` con `apps/mcp/docker-compose.yml`

## Alexa+ linking (resumen)

1. Usuario guarda wstoken en `/dashboard` (cifrado en Neon)
2. Alexa inicia OAuth → `/oauth/authorize` → `/oauth/alexa/consent` (Clerk)
3. Web llama MCP `create-code` → redirect a Alexa con `code`
4. Alexa intercambia en `/oauth/token` (PKCE) → Bearer
5. MCP `/mcp` valida Bearer → carga wstoken del user → Moodle

No hace falta Auth0/otro IdP: Clerk = login web; OAuth Alexa = endpoints en el MCP.

## Clerk

No hay API MCP aquí para crear la app automáticamente. Crea manualmente:

1. https://dashboard.clerk.com → New application → **moodle-ai**
2. Habilita email/OAuth que quieras
3. Copia `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` a Vercel / `.env.local`
