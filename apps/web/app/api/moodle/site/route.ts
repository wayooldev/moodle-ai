import { NextResponse } from "next/server";
import { requireCampusCredential } from "@/lib/campus";

export async function GET() {
  const result = await requireCampusCredential();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const site = await result.campus.moodle.getSiteInfo();
    return NextResponse.json({
      sitename: site?.sitename ?? null,
      fullname: site?.fullname ?? null,
      username: site?.username ?? null,
      userid: site?.userid ?? null,
      siteurl: site?.siteurl ?? result.campus.moodleUrl,
      release: site?.release ?? null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load site" },
      { status: 502 }
    );
  }
}
