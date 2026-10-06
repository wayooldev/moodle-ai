import { auth } from "@clerk/nextjs/server";
import { createMoodleClient } from "@moodle-ai/moodle";
import { NextResponse } from "next/server";
import { enforceWriteRateLimit } from "@/lib/ratelimit";
import { getCampusCredential } from "@/lib/campus";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceWriteRateLimit(req, userId);
  if (limited) return limited;

  try {
    const body = await req.json().catch(() => ({}));
    const moodleUrl = body.moodleUrl
      ? String(body.moodleUrl).replace(/\/$/, "")
      : null;
    const wstoken = body.wstoken ? String(body.wstoken).trim() : null;

    let client;
    if (moodleUrl && wstoken) {
      client = createMoodleClient({ baseUrl: moodleUrl, token: wstoken });
    } else {
      const campus = await getCampusCredential();
      if (!campus) {
        return NextResponse.json(
          { error: "Provide moodleUrl+wstoken or save credentials first" },
          { status: 400 }
        );
      }
      client = campus.moodle;
    }

    const info = await client.testConnection();
    return NextResponse.json({ ok: true, site: info });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Connection failed",
      },
      { status: 400 }
    );
  }
}
