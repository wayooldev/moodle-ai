import { NextResponse } from "next/server";
import { requireCampusCredential } from "@/lib/campus";

export async function GET() {
  const result = await requireCampusCredential();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const site = await result.campus.moodle.getSiteInfo();
    const courses = await result.campus.moodle.getEnrolledCourses(site.userid);
    const list = Array.isArray(courses)
      ? courses.map((c: Record<string, unknown>) => ({
          id: Number(c.id),
          fullname: String(c.fullname || c.shortname || "Course"),
          shortname: String(c.shortname || ""),
          startdate: Number(c.startdate) || null,
          enddate: Number(c.enddate) || null,
          visible: c.visible !== 0 && c.visible !== false,
        }))
      : [];
    return NextResponse.json({ courses: list });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load courses" },
      { status: 502 }
    );
  }
}
