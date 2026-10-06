import * as Sentry from "@sentry/node";
import { scrubSentryEvent } from "@moodle-ai/ops/scrub";

let initialized = false;

export function initMcpSentry() {
  if (initialized) return;
  initialized = true;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      return scrubSentryEvent(event);
    },
  });
}

export { Sentry };
