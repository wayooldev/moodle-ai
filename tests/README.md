# Unit tests (Vitest)

Run from repo root:

```bash
npm test
```

Coverage focus for this baseline:

- `packages/db` AES-GCM encrypt/decrypt (`tests/crypto.test.js`)
- MCP OAuth helpers PKCE / sha256 (`tests/oauth-crypto.test.js`)
- Sentry scrubber (`tests/scrub.test.js`)
- Rate-limit key + memory limiter (`tests/ratelimit.test.js`)
- MCP env Zod schema (`tests/env-schema.test.js`)
- Moodle normalize helpers (`tests/moodle-normalize.test.js`)
- Web JSON body helper (`tests/http-json.test.ts`)
- Campus UUID user id helper (`tests/campus-userid.test.ts`)
- Credentials feedback channel policy (`tests/credentials-feedback.test.ts`)

E2E (Playwright, requires `E2E_CLERK_*`): onboarding save success + **single-toast error** cases in `e2e/dashboard-auth.spec.ts`.

No live Neon or Alexa device is required for unit tests.
