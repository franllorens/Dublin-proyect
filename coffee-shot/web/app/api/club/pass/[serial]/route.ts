import { NextRequest, NextResponse } from "next/server";
import { getPassView } from "@/src/lib/db";
import { buildApplePass } from "@/src/lib/apple";
import { locationsOf } from "@/src/lib/stamps";

/** First download of the .pkpass, from the "Add to Apple Wallet" button. Safari opens it straight into Wallet. */
export async function GET(req: NextRequest, { params }: { params: { serial: string } }) {
  const p = await getPassView(params.serial);
  if (!p || req.nextUrl.searchParams.get("k") !== p.auth_token) {
    return NextResponse.json({ error: "Card not found." }, { status: 404 });
  }
  const buf = await buildApplePass(p, await locationsOf(p.tenant_id));
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="${p.serial}.pkpass"`,
    },
  });
}
