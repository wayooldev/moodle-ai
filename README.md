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
apps/web     Next.js → Vercel via GitHub (Clerk, dashboard BYOK, consent Alexa)
apps/mcp     Express MCP + OAuth AS → VPS vía GHCR
packages/db  Postgres helpers + cifrado AES-GCM
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
3. `npm install` en la raíz
4. Clerk: crea aplicación **moodle-ai** en https://dashboard.clerk.com y pega keys en Vercel Project Settings → Environment Variables (Production + Preview)
5. Seed cliente Alexa (cuando tengas client_id/secret del add-on):

```bash
DATABASE_URL=... node scripts/seed-alexa-client.mjs <client_id> <client_secret> <redirect_uri>
```

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
