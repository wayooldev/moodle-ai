## 1. Foundation y tooling de workspace

- [x] 1.1 Añadir ESLint (web) + scripts root `lint`, `typecheck`, `test`, `test:e2e` y verificar que `npm run lint` / `npm run typecheck` ejecutan sin errores fatales de config
- [x] 1.2 Instalar Vitest en el monorepo (config root o packages) y verificar que `npm test` corre una suite vacía/verde
- [x] 1.3 Instalar Playwright (`@playwright/test`) con `e2e/` + config y verificar `npx playwright test --list` lista specs

## 2. Typed environment

- [x] 2.1 Crear `apps/web` env tipado con `@t3-oss/env-nextjs` (Clerk, DB, MCP, Sentry, Upstash) y verificar que build falla si falta una secret requerida
- [x] 2.2 Crear validación Zod de boot en `apps/mcp` para variables críticas y verificar que el proceso no escucha si falta `TOKEN_ENCRYPTION_KEY`
- [x] 2.3 Actualizar `.env.example` (root, web, mcp) con las nuevas vars y verificar que documentan Sentry + Upstash sin secretos reales

## 3. Observability (Sentry)

- [x] 3.1 Integrar `@sentry/nextjs` en web (client/server/edge según plantilla) con `beforeSend` scrubber y verificar que un error de prueba se reporta solo cuando `SENTRY_DSN` está definido
- [x] 3.2 Integrar `@sentry/node` en MCP con el mismo scrubber y verificar que Authorization / API keys no aparecen en el payload de prueba
- [x] 3.3 Añadir test unitario del scrubber (headers/body keys sensibles) y verificar que Vitest lo cubre en verde

## 4. Distributed rate limiting

- [x] 4.1 Añadir helper compartido o por-app de `@upstash/ratelimit` (keys userId → client_id → IP) y verificar módulo exporta `limit` + política fail-closed para writes
- [x] 4.2 Aplicar límite a MCP `/oauth/token` y verificar respuesta 429 al exceder (test de integración o unit del middleware con mock)
- [x] 4.3 Aplicar límite a web `POST /api/moodle/credentials` y `POST /api/oauth/create-code` y verificar 429 sin persistir/crear código
- [x] 4.4 Aplicar límite a entrada `/mcp` (por API key / bearer subject) y verificar 429 bajo abuso simulado

## 5. Vitest (unit)

- [x] 5.1 Tests de `packages/db` crypto: roundtrip encrypt/decrypt + ciphertext degradado y verificar suite verde con `TOKEN_ENCRYPTION_KEY` de test
- [x] 5.2 Tests de helpers OAuth puros (p. ej. PKCE/state o parsing sin red) y verificar cobertura mínima documentada en el README de tests
- [x] 5.3 Tests del env schema (web y/o mcp) con fixtures válidas/inválidas y verificar fallos esperados

## 6. Playwright e2e

- [x] 6.1 Decidir e implementar auth de prueba Clerk (`@clerk/testing` preferido) y verificar un test que llega autenticado al dashboard
- [x] 6.2 E2E: visitante no autenticado a `/dashboard` es redirigido a sign-in; verificar aserción estable por rol/URL
- [x] 6.3 E2E: usuario autenticado guarda wstoken (API stub o test DB) y ve mensaje de éxito; verificar que el campo password no queda relleno tras éxito
- [x] 6.4 E2E smoke: `/oauth/alexa/consent` con query stub renderiza UI de consent para usuario autenticado sin handshake Alexa real; marcar `fix`/`skip` documentado si el linking sigue incompleto
- [x] 6.5 Documentar en README cómo correr e2e local/CI y qué secrets hacen falta; verificar que el doc menciona el smoke Alexa diferido

## 7. CI GitHub Actions

- [x] 7.1 Crear `.github/workflows/quality.yml` (PR a `dev`/`main`, push `dev`) con lint, typecheck, vitest, build web y verificar que el workflow pasa en un run de prueba o `act`/dry-run de syntax
- [x] 7.2 Añadir job e2e (Playwright) que se salta o reporta skip claro si faltan secrets Clerk de test; verificar que no bloquea quality unitaria cuando secrets ausentes
- [x] 7.3 Confirmar que `mcp-ghcr.yml` sigue intacto y solo dispara por paths MCP; verificar diff del workflow existente sin cambios funcionales no deseados

## 8. Cierre

- [x] 8.1 Listar secrets a configurar en Vercel, VPS MCP y GitHub (Sentry, Upstash, e2e Clerk) en un checklist del change o README y verificar que no se commitean valores
- [x] 8.2 Correr `openspec validate moodle-ai-production-tooling` y asegurar que lint/typecheck/test locales pasan antes de pedir review
