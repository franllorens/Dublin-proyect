import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/src/lib/staff";
import { redeem } from "@/src/lib/stamps";

/** Barista app: POST { serial, staffId, pin } to give the free coffee. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as { serial?: string; staffId?: string; pin?: string } | null;
  if (!b?.serial || !b.staffId || !b.pin) return NextResponse.json({ error: "Send serial, staffId and pin." }, { status: 400 });
  const staff = await verifyStaff(b.staffId, b.pin);
  if (!staff) return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  const r = await redeem(b.serial, staff);
  return NextResponse.json(r, { status: r.ok ? 200 : 409 });
}
