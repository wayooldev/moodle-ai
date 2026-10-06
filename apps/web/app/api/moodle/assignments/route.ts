import { NextResponse } from "next/server";
import { requireCampusCredential } from "@/lib/campus";

export async function GET(req: Request) {
  const result = await requireCampusCredential();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const url = new URL(req.url);
    const courseParam = url.searchParams.get("courseids");
    let courseids: number[];

    if (courseParam) {
      courseids = courseParam
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
    } else {
      const site = await result.campus.moodle.getSiteInfo();
      const courses = await result.campus.moodle.getEnrolledCourses(
        site.userid
      );
      courseids = Array.isArray(courses)
        ? courses.map((c: { id: number }) => Number(c.id)).filter(Boolean)
        : [];
    }

    if (courseids.length === 0) {
      return NextResponse.json({ assignments: [] });
    }

    const assignments =
      await result.campus.moodle.getAssignmentsNormalized(courseids);
    return NextResponse.json({ assignments });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to load assignments",
      },
      { status: 502 }
    );
  }
}
