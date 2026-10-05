import { auth, currentUser } from "@clerk/nextjs/server";
import { query } from "@moodle-ai/db";
import { encryptSecret } from "@moodle-ai/db/crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const moodleUrl = String(body.moodleUrl || "").replace(/\/$/, "");
  const wstoken = String(body.wstoken || "").trim();
  const label = body.label ? String(body.label) : null;

  if (!moodleUrl || !wstoken) {
    return NextResponse.json({ error: "moodleUrl and wstoken required" }, { status: 400 });
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    null;

  let dbUser = await query(`SELECT id FROM users WHERE clerk_user_id = $1`, [userId]);
  if (!dbUser.rows[0]) {
    dbUser = await query(
      `INSERT INTO users (clerk_user_id, email) VALUES ($1, $2) RETURNING id`,
      [userId, email]
    );
  }

  const { ciphertext, nonce } = encryptSecret(wstoken);
  await query(
    `INSERT INTO moodle_credentials (user_id, moodle_url, wstoken_ciphertext, wstoken_nonce, label)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, moodle_url)
     DO UPDATE SET wstoken_ciphertext = EXCLUDED.wstoken_ciphertext,
                   wstoken_nonce = EXCLUDED.wstoken_nonce,
                   label = EXCLUDED.label,
                   updated_at = now()`,
    [dbUser.rows[0].id, moodleUrl, ciphertext, nonce, label]
  );

  return NextResponse.json({ ok: true });
}
