import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/src/lib/staff";
import { addStamp } from "@/src/lib/stamps";

/** Barista app: POST { serial, staffId, pin } after scanning the card's QR. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as { serial?: string; staffId?: string; pin?: string } | null;
  if (!b?.serial || !b.staffId || !b.pin) return NextResponse.json({ error: "Send serial, staffId and pin." }, { status: 400 });
  const staff = await verifyStaff(b.staffId, b.pin);
  if (!staff) return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  const r = await addStamp(b.serial, "scan", staff);
  return NextResponse.json(r.ok ? { ok: true, message: r.message, stamps: r.pass.stamps, reward: r.pass.reward_ready } : r, {
    status: r.ok ? 200 : r.reason === "not_found" ? 404 : 409,
  });
}
