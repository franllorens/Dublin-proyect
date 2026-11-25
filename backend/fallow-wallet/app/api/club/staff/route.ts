import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/db";

/**
 * GET ?tenant=fallow → baristas per location, for the barista PWA's sign-in picker.
 * Names and ids only: the PIN is still checked on every stamp/redeem.
 */
export async function GET(req: NextRequest) {
  const tenant = req.nextUrl.searchParams.get("tenant");
  if (!tenant) return NextResponse.json({ error: "Send tenant." }, { status: 400 });
  const { data, error } = await db()
    .from("staff")
    .select("id, name, locations!inner(slug, tenants!inner(slug))")
    .eq("locations.tenants.slug", tenant);
  if (error) throw error;
  return NextResponse.json(
    (data ?? []).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      location: (r.locations as unknown as { slug: string }).slug,
    })),
  );
}
