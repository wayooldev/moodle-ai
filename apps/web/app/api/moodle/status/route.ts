import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCampusCredential, hasCampusCredentials } from "@/lib/campus";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connected = await hasCampusCredentials(userId);
  if (!connected) {
    return NextResponse.json({ connected: false });
  }

  const campus = await getCampusCredential();
  return NextResponse.json({
    connected: true,
    moodleUrl: campus?.moodleUrl ?? null,
    label: campus?.label ?? null,
    hasToken: Boolean(campus),
  });
}
