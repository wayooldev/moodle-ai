import { NextResponse } from "next/server";
import { requireCampusCredential } from "@/lib/campus";

export async function GET(req: Request) {
  const result = await requireCampusCredential();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const url = new URL(req.url);
    const timestart = url.searchParams.get("timestart");
    const timeend = url.searchParams.get("timeend");
    const data = await result.campus.moodle.getCalendarEvents({
      timestart: timestart ? Number(timestart) : undefined,
      timeend: timeend ? Number(timeend) : undefined,
    });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        events: [],
        source: "error",
        error: err instanceof Error ? err.message : "Failed to load calendar",
      },
      { status: 200 }
    );
  }
}