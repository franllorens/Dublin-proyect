import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db, getPassView } from "@/src/lib/db";
import { addStamp, locationsOf } from "@/src/lib/stamps";
import { saveUrl } from "@/src/lib/google";
import { env } from "@/src/lib/env";

/** POST { tenant: "fallow", firstName, email? } → links to add the card to Apple or Google Wallet. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { tenant?: string; firstName?: string; email?: string } | null;
  const firstName = body?.firstName?.trim();
  if (!body?.tenant || !firstName) {
    return NextResponse.json({ error: "Send tenant and firstName." }, { status: 400 });
  }

  const { data: tenant, error: tErr } = await db().from("tenants").select("id, slug").eq("slug", body.tenant).maybeSingle();
  if (tErr) throw tErr;
  if (!tenant) return NextResponse.json({ error: "Unknown tenant." }, { status: 404 });

  const { data: customer, error: cErr } = await db()
    .from("customers")
    .insert({ tenant_id: tenant.id, first_name: firstName.slice(0, 40), email: body.email?.trim() || null })
    .select("id")
    .single();
  if (cErr) throw cErr;

  const serial = "FLW-" + crypto.randomBytes(4).toString("hex").toUpperCase();
  const authToken = crypto.randomBytes(24).toString("hex");
  const { error: pErr } = await db()
    .from("passes")
    .insert({ serial, tenant_id: tenant.id, customer_id: customer.id, auth_token: authToken });
  if (pErr) throw pErr;

  await addStamp(serial, "welcome", { tenantSlug: tenant.slug });
  const pass = await getPassView(serial);
  const locs = await locationsOf(tenant.id);

  return NextResponse.json({
    serial,
    apple: `${env.baseUrl()}/api/club/pass/${serial}?k=${authToken}`,
    google: pass ? saveUrl(pass, tenant.slug, locs) : null,
  });
}
