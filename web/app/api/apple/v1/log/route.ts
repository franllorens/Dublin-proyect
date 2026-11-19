import { NextRequest, NextResponse } from "next/server";

/** Wallet reports errors here. Watch these logs while testing on a real iPhone. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { logs?: string[] } | null;
  for (const line of body?.logs ?? []) console.warn("[Apple Wallet]", line);
  return new NextResponse(null, { status: 200 });
}
