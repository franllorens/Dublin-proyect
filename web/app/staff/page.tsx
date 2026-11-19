import type { Metadata, Viewport } from "next";
import { clubLive } from "@/lib/mode";
import { StaffApp, type StaffMember } from "@/components/staff/StaffApp";

export const metadata: Metadata = {
  title: "Fallow · Barista",
  manifest: "/staff.webmanifest",
  appleWebApp: { capable: true, title: "Fallow Barista", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { themeColor: "#0b221d" };
export const dynamic = "force-dynamic";

/** In live mode the barista picks their name per location; PINs are checked by /api/club/stamp. */
async function staffList(): Promise<StaffMember[]> {
  if (!clubLive()) return [];
  try {
    const { db } = await import("@/src/lib/db");
    const { data } = await db()
      .from("staff")
      .select("id, name, locations!inner(slug, tenants!inner(slug))")
      .eq("locations.tenants.slug", "fallow");
    return (data ?? []).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      location: (r.locations as unknown as { slug: string }).slug,
    }));
  } catch {
    return [];
  }
}

export default async function StaffPage() {
  const live = clubLive();
  return <StaffApp live={live} staff={await staffList()} />;
}
