import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";

/**
 * Private feedback from the site ("Tell the team privately"). Added with the web app;
 * needs supabase/feedback.sql. Never linked to stamps or rewards.
 */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => null)) as { tenant?: string; location?: string; message?: string } | null;
  const message = b?.message?.trim();
  if (!b?.tenant || !message) return NextResponse.json({ error: "Send tenant and message." }, { status: 400 });
  const { data: tenant, error: tErr } = await db().from("tenants").select("id").eq("slug", b.tenant).maybeSingle();
  if (tErr) throw tErr;
  if (!tenant) return NextResponse.json({ error: "Unknown tenant." }, { status: 404 });
  const { error } = await db()
    .from("feedback")
    .insert({ tenant_id: tenant.id, location_slug: b.location ?? null, message: message.slice(0, 1200) });
  if (error) throw error;
  return NextResponse.json({ ok: true });
}
