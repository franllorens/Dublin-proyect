import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";

type P = { params: { deviceId: string; passTypeId: string } };

/** After a push, the iPhone asks which of its cards changed since its last update tag. */
export async function GET(req: NextRequest, { params }: P) {
  const since = req.nextUrl.searchParams.get("passesUpdatedSince");
  const { data: regs, error } = await db()
    .from("apple_registrations")
    .select("serial")
    .match({ device_library_id: params.deviceId, pass_type_id: params.passTypeId });
  if (error) throw error;
  const serials = (regs ?? []).map((r: { serial: string }) => r.serial);
  if (!serials.length) return new NextResponse(null, { status: 204 });

  let q = db().from("passes").select("serial, updated_at").in("serial", serials);
  if (since) q = q.gt("updated_at", new Date(Number(since)).toISOString());
  const { data: changed, error: e2 } = await q;
  if (e2) throw e2;
  if (!changed?.length) return new NextResponse(null, { status: 204 });

  const last = Math.max(...changed.map((c: { updated_at: string }) => new Date(c.updated_at).getTime()));
  return NextResponse.json({
    serialNumbers: changed.map((c: { serial: string }) => c.serial),
    lastUpdated: String(last),
  });
}
