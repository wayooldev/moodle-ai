const SENSITIVE_KEY =
  /^(authorization|x-api-key|x-internal-key|cookie|set-cookie|wstoken|token|access_token|refresh_token|client_secret|password|api[_-]?key|database_url|token_encryption_key|clerk_secret_key|mcp_api_key|internal_api_key)$/i;

const SENSITIVE_HEADER = /^(authorization|x-api-key|x-internal-key|cookie)$/i;

const REDACTED = "[Redacted]";

function scrubValue(key, value) {
  if (value == null) return value;
  if (SENSITIVE_KEY.test(String(key))) return REDACTED;
  if (typeof value === "string") {
    if (/^Bearer\s+\S+/i.test(value)) return "Bearer [Redacted]";
    if (value.length > 8 && /^(sk_|pk_live_|wstoken)/i.test(value)) return REDACTED;
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => scrubValue(String(i), item));
  }
  if (typeof value === "object") {
    return scrubObject(value);
  }
  return value;
}

export function scrubObject(input) {
  if (!input || typeof input !== "object") return input;
  const out = Array.isArray(input) ? [] : {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = scrubValue(key, value);
  }
  return out;
}

/**
 * Sentry beforeSend-compatible scrubber.
 * @param {import('@sentry/types').ErrorEvent | Record<string, unknown>} event
 */
export function scrubSentryEvent(event) {
  if (!event || typeof event !== "object") return event;

  const next = { ...event };

  if (next.request && typeof next.request === "object") {
    const req = { ...next.request };
    if (req.headers && typeof req.headers === "object") {
      const headers = {};
      for (const [key, value] of Object.entries(req.headers)) {
        headers[key] = SENSITIVE_HEADER.test(key) ? REDACTED : value;
      }
      req.headers = headers;
    }
    if (req.data) {
      req.data = scrubObject(req.data);
    }
    if (req.query_string && typeof req.query_string === "string") {
      req.query_string = req.query_string
        .replace(/api_key=[^&]*/gi, "api_key=[Redacted]")
        .replace(/wstoken=[^&]*/gi, "wstoken=[Redacted]");
    }
    next.request = req;
  }

  if (next.extra) {
    next.extra = scrubObject(next.extra);
  }

  if (next.contexts) {
    next.contexts = scrubObject(next.contexts);
  }

  if (Array.isArray(next.breadcrumbs)) {
    next.breadcrumbs = next.breadcrumbs.map((crumb) => {
      if (!crumb || typeof crumb !== "object") return crumb;
      return {
        ...crumb,
        data: crumb.data ? scrubObject(crumb.data) : crumb.data,
        message:
          typeof crumb.message === "string" && /Bearer\s+\S+/i.test(crumb.message)
            ? crumb.message.replace(/Bearer\s+\S+/gi, "Bearer [Redacted]")
            : crumb.message,
      };
    });
  }

  return next;
}

export { REDACTED, SENSITIVE_KEY };
