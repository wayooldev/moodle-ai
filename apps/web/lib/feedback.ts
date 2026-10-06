/**
 * Single-channel feedback policy for credential flows.
 * Errors/success must not render both toast and inline alert.
 */
export const CREDENTIALS_FEEDBACK_CHANNEL = "toast" as const;

export function assertSingleFeedbackChannel(
  channel: typeof CREDENTIALS_FEEDBACK_CHANNEL
): typeof CREDENTIALS_FEEDBACK_CHANNEL {
  if (channel !== "toast") {
    throw new Error("Credentials feedback must use toast only");
  }
  return channel;
}
