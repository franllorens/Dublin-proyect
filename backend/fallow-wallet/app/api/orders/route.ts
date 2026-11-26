import { NextRequest, NextResponse } from "next/server";
import { cleanLines, createOrder } from "@/src/lib/orders";

/** Site: POST { tenant, location, name, lines, pickupAt, asap } → { id, number, status }. Paid at the hatch. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof b?.name === "string" ? b.name.trim().slice(0, 40) : "";
  const lines = cleanLines(b?.lines);
  const pickupAt = Number(b?.pickupAt);
  if (!b?.tenant || !b.location || !name || !lines || !Number.isInteger(pickupAt) || pickupAt < 0 || pickupAt > 1439) {
    return NextResponse.json({ error: "Send tenant, location, name, lines (1–8) and pickupAt (minutes)." }, { status: 400 });
  }
  const order = await createOrder({
    tenantSlug: String(b.tenant),
    locationSlug: String(b.location),
    name,
    lines,
    pickupAt,
    asap: b.asap === true,
  });
  if (!order) return NextResponse.json({ error: "Unknown location." }, { status: 404 });
  return NextResponse.json(order, { status: 201 });
}
