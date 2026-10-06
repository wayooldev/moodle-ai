/** Neon `users.id` is UUID text — never coerce with Number() (becomes NaN). */
export function asDbUserId(id: unknown): string {
  if (id == null) {
    throw new Error("missing database user id");
  }
  const value = String(id).trim();
  if (!value || value === "NaN") {
    throw new Error("invalid database user id");
  }
  return value;
}
