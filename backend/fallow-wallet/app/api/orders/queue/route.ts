import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/src/lib/staff";
import { queueFor } from "@/src/lib/orders";

/** Barista: POST { staffId, pin } → today's open tickets for their hatch, earliest pickup first. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as { staffId?: string; pin?: string } | null;
  if (!b?.staffId || !b.pin) return NextResponse.json({ error: "Send staffId and pin." }, { status: 400 });
  const staff = await verifyStaff(b.staffId, b.pin);
  if (!staff) return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  return NextResponse.json(await queueFor(staff.locationId));
}
