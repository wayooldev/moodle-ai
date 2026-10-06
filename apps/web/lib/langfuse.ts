import { Langfuse } from "langfuse";
import { scrubObject } from "@moodle-ai/ops/scrub";

let client: Langfuse | null | undefined;

export function getLangfuse(): Langfuse | null {
  if (client !== undefined) return client;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  if (!secretKey || !publicKey) {
    client = null;
    return client;
  }
  client = new Langfuse({
    secretKey,
    publicKey,
    baseUrl: process.env.LANGFUSE_BASE_URL,
  });
  return client;
}

export function scrubForTrace(value: unknown) {
  return scrubObject(value as Record<string, unknown>);
}
