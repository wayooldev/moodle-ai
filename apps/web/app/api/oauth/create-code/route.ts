import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { enforceWriteRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await enforceWriteRateLimit(req, userId);
  if (limited) return limited;

  const body = await req.json();
  const mcpBase = env.MCP_BASE_URL || env.NEXT_PUBLIC_MCP_BASE_URL;
  const internalKey = env.INTERNAL_API_KEY || env.MCP_API_KEY;
  if (!mcpBase || !internalKey) {
    return NextResponse.json(
      { error: "MCP_BASE_URL / INTERNAL_API_KEY not configured" },
      { status: 500 }
    );
  }

  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    null;

  const res = await fetch(`${mcpBase.replace(/\/$/, "")}/oauth/internal/create-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": internalKey,
    },
    body: JSON.stringify({
      ...body,
      clerk_user_id: userId,
      email,
    }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
