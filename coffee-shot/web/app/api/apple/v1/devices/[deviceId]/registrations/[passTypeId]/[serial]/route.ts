import { NextRequest, NextResponse } from "next/server";
import { db, getPassView } from "@/src/lib/db";
import { appleAuthOk } from "@/src/lib/apple";

type P = { params: { deviceId: string; passTypeId: string; serial: string } };

/** PassKit web service: an iPhone added this card and wants update pushes. */
export async function POST(req: NextRequest, { params }: P) {
  const p = await getPassView(params.serial);
  if (!p || !appleAuthOk(req.headers.get("authorization"), p.auth_token)) return new NextResponse(null, { status: 401 });
  const body = (await req.json().catch(() => null)) as { pushToken?: string } | null;
  if (!body?.pushToken) return new NextResponse(null, { status: 400 });

  const { data: existing } = await db()
    .from("apple_registrations")
    .select("serial")
    .match({ device_library_id: params.deviceId, pass_type_id: params.passTypeId, serial: params.serial })
    .maybeSingle();
  const { error } = await db().from("apple_registrations").upsert({
    device_library_id: params.deviceId,
    pass_type_id: params.passTypeId,
    serial: params.serial,
    push_token: body.pushToken,
  });
  if (error) throw error;
  return new NextResponse(null, { status: existing ? 200 : 201 });
}

/** The card was removed from that iPhone. */
export async function DELETE(req: NextRequest, { params }: P) {
  const p = await getPassView(params.serial);
  if (!p || !appleAuthOk(req.headers.get("authorization"), p.auth_token)) return new NextResponse(null, { status: 401 });
  await db()
    .from("apple_registrations")
    .delete()
    .match({ device_library_id: params.deviceId, pass_type_id: params.passTypeId, serial: params.serial });
  return new NextResponse(null, { status: 200 });
}
