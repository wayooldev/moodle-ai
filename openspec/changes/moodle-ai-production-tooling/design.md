## Context

Monorepo npm workspaces (`apps/web`, `apps/mcp`, `packages/db`). Hoy solo hay deploy: Vercel (web) + `mcp-ghcr.yml`. No hay ESLint/Prettier/Husky, ni env tipado, ni Sentry, ni rate limit distribuido, ni Vitest/Playwright. Ver proposal.md — Why. Alexa+ OAuth existe en código pero el linking aún no está estable; e2e completo del handshake queda diferido a smoke/stub.

## Goals / Non-Goals

**Goals:**
- Validación de env fall-fast en web y MCP
- Sentry con scrubbing en ambos runtimes
- Rate limit Upstash en rutas sensibles
- CI de calidad + Vitest + Playwright (Clerk/BYOK + smoke Alexa)
- Documentar secrets nuevos sin romper el flujo `dev` → PR → `main`

**Non-Goals:**
- Langfuse, PostHog, Sonner, Husky/Prettier (P1)
- Redis como cache, i18n, Prisma migration
- E2E Alexa end-to-end con skill real
- Cambiar contratos OAuth/MCP más allá de wrappers (limit/Sentry)

## Decisions

### 1. Env tipado: `@t3-oss/env-nextjs` en web + Zod en MCP
- **Rationale:** web necesita separación build-time `NEXT_PUBLIC_*`; MCP es Express JS y puede validar con Zod ya presente.
- **Alternatives:** un solo paquete shared — descartado por runtimes distintos (Next vs Node ESM plano).

### 2. Sentry: `@sentry/nextjs` + `@sentry/node` en MCP
- **Rationale:** SDKs oficiales por runtime; release = git SHA.
- **Scrubbing:** `beforeSend` denylist de headers/body keys (`authorization`, `x-api-key`, `wstoken`, `TOKEN_ENCRYPTION_KEY`, `DATABASE_URL`).
- **Alternatives:** solo logs — insuficiente para baseline productivo.

### 3. Rate limit: `@upstash/ratelimit` + Redis REST (solo backend de límites)
- **Rationale:** MCP puede correr multi-instancia; memoria local no basta.
- **Keys:** `userId` (Clerk/OAuth subject) → else `client_id` → else IP.
- **Policy on Upstash outage:** fail-open for read-ish MCP tools listing is acceptable; **fail-closed (429/503)** for `/oauth/token` and credentials write.
- **Alternatives:** in-memory — descartado.

### 4. Vitest en workspace root (o package `tests`)
- Cubrir `packages/db/crypto.js` y helpers puros de OAuth (PKCE/state parsing) sin DB real.
- Integración con Neon: opcional/skip si no hay `DATABASE_URL` de test.

### 5. Playwright en `e2e/`
- Clerk: `@clerk/testing` o test keys + bypass documentado.
- Stub `POST /api/moodle/credentials` o usar DB de test + encryption key de CI.
- Alexa consent: visita autenticada a `/oauth/alexa/consent` con query params stub; **no** completa token exchange.
- CI: job Playwright opcional/separado si es lento; mínimo smoke en PR.

### 6. CI workflow nuevo `quality.yml`
- Triggers: PR a `dev`/`main`, push a `dev`.
- Jobs: lint (añadir ESLint mínimo si no existe), `tsc` web, `vitest`, `next build`.
- Secrets: no imprimir; Sentry/Upstash opcionales en CI (feature-flagged off si faltan).
- No reemplaza `mcp-ghcr.yml`.

### 7. Nuevas env vars
Web: `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` (CI), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, existentes Clerk/DB.
MCP: `SENTRY_DSN`, mismas Upstash, existentes OAuth/DB/crypto.
E2E: `E2E_CLERK_*` / testing tokens según enfoque elegido en apply.

## Risks / Trade-offs

- [Clerk e2e flaky] → Usar testing helpers oficiales; documentar secrets; marcar smoke Alexa como `test.fix` hasta linking estable.
- [Upstash outage bloquea OAuth] → Fail-closed solo en token/credentials; métrica/alerta Sentry en 429/503 del limiter.
- [Sentry captura secretos] → Tests unitarios del scrubber + review de `beforeSend`.
- [CI sin Neon] → Unit tests no dependen de DB; e2e stubéa credentials API.
- [Repo público] → Nunca commitear DSN con auth embebida innecesaria; rotar si se filtra.

## Migration Plan

1. Añadir dependencias y configs sin activar fail-fast en preview hasta validar Vercel env.
2. Desplegar env tipado en preview; completar variables Production.
3. Encender Sentry y rate limit detrás de env presentes (no-op si faltan en local).
4. Mergear workflow quality; requerir check en branch protection de `main` cuando esté verde.
5. Rollback: feature flags por ausencia de `SENTRY_DSN` / Upstash vars; revert del workflow si bloquea deploys.

## Open Questions

- ¿Clerk testing vía `@clerk/testing` o cuenta de test + email magic link? Resolver en apply según keys disponibles.
- ¿Playwright en el mismo workflow quality o job nightly? Preferencia: job separado `e2e` en PR, allow-failure solo si secrets e2e ausentes.
