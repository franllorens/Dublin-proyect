import { NextRequest, NextResponse } from "next/server";
import { getPassView } from "@/src/lib/db";
import { appleAuthOk, buildApplePass } from "@/src/lib/apple";
import { locationsOf } from "@/src/lib/stamps";

type P = { params: { passTypeId: string; serial: string } };

/** The iPhone downloads the latest version of a card (after a push, or on pull-to-refresh). */
export async function GET(req: NextRequest, { params }: P) {
  const p = await getPassView(params.serial);
  if (!p || !appleAuthOk(req.headers.get("authorization"), p.auth_token)) return new NextResponse(null, { status: 401 });

  const lastModified = new Date(p.updated_at);
  const ims = req.headers.get("if-modified-since");
  if (ims && new Date(ims).getTime() >= Math.floor(lastModified.getTime() / 1000) * 1000) {
    return new NextResponse(null, { status: 304 });
  }
  const buf = await buildApplePass(p, await locationsOf(p.tenant_id));
  return new NextResponse(new Uint8Array(buf), {
    headers: { "Content-Type": "application/vnd.apple.pkpass", "Last-Modified": lastModified.toUTCString() },
  });
}
