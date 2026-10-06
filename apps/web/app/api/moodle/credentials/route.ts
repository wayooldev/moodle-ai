import { auth } from "@clerk/nextjs/server";
import { query } from "@moodle-ai/db";
import { encryptSecret } from "@moodle-ai/db/crypto";
import { NextResponse } from "next/server";
import { ensureDbUser } from "@/lib/campus";
import { enforceWriteRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const limited = await enforceWriteRateLimit(req, userId);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const moodleUrl = String(body.moodleUrl || "").replace(/\/$/, "");
    const wstoken = String(body.wstoken || "").trim();
    const label = body.label ? String(body.label) : null;

    if (!moodleUrl) {
      return NextResponse.json(
        { error: "Indica la URL del campus." },
        { status: 400 }
      );
    }

    const dbUserId = await ensureDbUser(userId);
    const existing = await query(
      `SELECT moodle_url FROM moodle_credentials
       WHERE user_id = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [dbUserId]
    );
    const previousUrl = existing.rows[0]?.moodle_url as string | undefined;

    if (!wstoken) {
      if (!previousUrl) {
        return NextResponse.json(
          { error: "Indica la URL del campus y el token de acceso." },
          { status: 400 }
        );
      }
      await query(
        `UPDATE moodle_credentials
         SET moodle_url = $1, label = $2, updated_at = now()
         WHERE user_id = $3 AND moodle_url = $4`,
        [moodleUrl, label, dbUserId, previousUrl]
      );
      return NextResponse.json({ ok: true });
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
      [dbUserId, moodleUrl, ciphertext, nonce, label]
    );

    if (previousUrl && previousUrl !== moodleUrl) {
      await query(
        `DELETE FROM moodle_credentials
         WHERE user_id = $1 AND moodle_url = $2`,
        [dbUserId, previousUrl]
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("credentials save failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo guardar la conexión del campus",
      },
      { status: 500 }
    );
  }
}
