---
linear_story_id: "78746c0d-9d20-4372-b402-ed2544f91db0"
linear_story_identifier: "WAY-147"
linear_story_title: "[MAI] Baseline de tooling de producción (env, Sentry, rate limit, CI, tests)"
linear_story_url: "https://linear.app/wayool/issue/WAY-147/mai-baseline-de-tooling-de-produccion-env-sentry-rate-limit-ci-tests"
linear_story_state: "Todo"
linear_team: "Wayool"
linear_project: "moodle-ai"
linear_label: "MAI"
---

## Why

moodle-ai ya expone web (Clerk + BYOK) y un MCP/OAuth público, pero opera sin validación tipada de entorno, sin observabilidad de errores, sin rate limiting distribuido y sin pruebas/CI de calidad. Antes de cerrar el linking Alexa+, hace falta un baseline operativo que detecte fallos, limite abuso y verifique los flujos críticos de forma reproducible.

## What Changes

- Agregar validación tipada de variables de entorno en `apps/web` (`@t3-oss/env-nextjs`) y en `apps/mcp` (Zod al boot).
- Incorporar Sentry en web y MCP, con scrubbing de `wstoken`, API keys, Bearer tokens y secretos.
- Sustituir cualquier límite ad-hoc/en-memoria por `@upstash/ratelimit` en rutas sensibles: OAuth token, create-code, credentials, `/mcp`.
- Crear GitHub Actions de calidad (lint, typecheck, Vitest, build web) además del workflow GHCR existente.
- Añadir Vitest para crypto, helpers OAuth y módulos puros de `packages/db` / MCP.
- Añadir Playwright para Clerk login + dashboard BYOK; smoke/stub del consent Alexa hasta que el linking esté estable.
- Documentar nuevas variables de entorno y claves de CI/secretos.

## Capabilities

### New Capabilities

- `typed-environment`: validación y tipado de env en build/runtime para web y MCP.
- `production-observability`: captura de errores/performance con Sentry y privacidad de secretos.
- `distributed-api-protection`: rate limiting distribuido en endpoints costosos/sensibles.
- `automated-quality-gates`: CI de calidad + suite Vitest.
- `critical-flow-e2e`: Playwright para login Clerk, guardado BYOK y smoke Alexa consent.

### Modified Capabilities

Ninguna (no hay specs canónicos previos).

## Impact

Afecta `apps/web` (Next config, middleware, API routes, layout), `apps/mcp` (boot Express, auth/oauth), `packages/db` (tests), root `package.json`/workspaces, nuevos `tests/` y `e2e/`, `.github/workflows/`, y variables en Vercel/VPS/GitHub Secrets. No cambia el esquema Neon ni el contrato OAuth funcional; Alexa e2e completo queda como stub/smoke hasta integración estable.

Negocio / contexto detallado: [WAY-147](https://linear.app/wayool/issue/WAY-147/mai-baseline-de-tooling-de-produccion-env-sentry-rate-limit-ci-tests).
