import { auth, currentUser } from "@clerk/nextjs/server";
import { query } from "@moodle-ai/db";
import { decryptSecret } from "@moodle-ai/db/crypto";
import { createMoodleClient, type MoodleClient } from "@moodle-ai/moodle";
import { asDbUserId } from "@/lib/db-user-id";

export type CampusCredential = {
  userId: string;
  dbUserId: string;
  moodleUrl: string;
  label: string | null;
  moodle: MoodleClient;
};

export { asDbUserId } from "@/lib/db-user-id";

export async function getDbUserId(clerkUserId: string): Promise<string | null> {
  const result = await query(`SELECT id FROM users WHERE clerk_user_id = $1`, [
    clerkUserId,
  ]);
  const id = result.rows[0]?.id;
  return id == null ? null : asDbUserId(id);
}

export async function ensureDbUser(clerkUserId: string): Promise<string> {
  const existing = await getDbUserId(clerkUserId);
  if (existing != null) return existing;

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    null;

  const inserted = await query(
    `INSERT INTO users (clerk_user_id, email) VALUES ($1, $2) RETURNING id`,
    [clerkUserId, email]
  );
  return asDbUserId(inserted.rows[0].id);
}

export async function hasCampusCredentials(
  clerkUserId: string
): Promise<boolean> {
  const dbUserId = await getDbUserId(clerkUserId);
  if (!dbUserId) return false;
  const creds = await query(
    `SELECT 1 FROM moodle_credentials WHERE user_id = $1 LIMIT 1`,
    [dbUserId]
  );
  return Boolean(creds.rows[0]);
}

export async function getCampusCredential(): Promise<CampusCredential | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUserId = await getDbUserId(userId);
  if (!dbUserId) return null;

  const creds = await query(
    `SELECT moodle_url, wstoken_ciphertext, wstoken_nonce, label
     FROM moodle_credentials
     WHERE user_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [dbUserId]
  );
  const row = creds.rows[0] as
    | {
        moodle_url: string;
        wstoken_ciphertext: string;
        wstoken_nonce: string;
        label: string | null;
      }
    | undefined;
  if (!row) return null;

  const wstoken = decryptSecret(row.wstoken_ciphertext, row.wstoken_nonce);
  return {
    userId,
    dbUserId,
    moodleUrl: row.moodle_url,
    label: row.label,
    moodle: createMoodleClient({
      baseUrl: row.moodle_url,
      token: wstoken,
    }),
  };
}

export async function requireCampusCredential(): Promise<
  | { ok: true; campus: CampusCredential }
  | { ok: false; status: 401 | 404; error: string }
> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  const campus = await getCampusCredential();
  if (!campus) {
    return { ok: false, status: 404, error: "Campus not connected" };
  }
  return { ok: true, campus };
}
