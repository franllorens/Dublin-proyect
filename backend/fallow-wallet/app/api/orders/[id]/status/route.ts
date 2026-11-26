import { NextRequest, NextResponse } from "next/server";
import { verifyStaff } from "@/src/lib/staff";
import { advanceOrder, type OrderStatus } from "@/src/lib/orders";

const STATUSES: OrderStatus[] = ["making", "ready", "collected"];

/** Barista: POST { staffId, pin, status } moves the ticket forward. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const b = (await req.json().catch(() => null)) as { staffId?: string; pin?: string; status?: OrderStatus } | null;
  if (!b?.staffId || !b.pin || !b.status || !STATUSES.includes(b.status)) {
    return NextResponse.json({ error: "Send staffId, pin and status." }, { status: 400 });
  }
  const staff = await verifyStaff(b.staffId, b.pin);
  if (!staff) return NextResponse.json({ error: "Wrong PIN." }, { status: 401 });
  const r = await advanceOrder(params.id, staff.locationId, b.status);
  return NextResponse.json(r, { status: r.ok ? 200 : r.reason === "not_found" ? 404 : 409 });
}
