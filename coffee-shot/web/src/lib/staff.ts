import crypto from "node:crypto";
import { db } from "./db";

export const hashPin = (pin: string) =>
  crypto.createHash("sha256").update(`${pin}:${process.env.STAFF_SESSION_SECRET ?? ""}`).digest("hex");

/** Returns the staff member and their location if the PIN matches. MVP: swap for real sessions later. */
export async function verifyStaff(staffId: string, pin: string) {
  const { data, error } = await db()
    .from("staff")
    .select("id, name, pin_hash, location_id, locations(tenant_id, tenants(slug))")
    .eq("id", staffId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.pin_hash !== hashPin(pin)) return null;
  const loc = data.locations as unknown as { tenant_id: string; tenants: { slug: string } };
  return { staffId: data.id as string, locationId: data.location_id as string, tenantSlug: loc.tenants.slug };
}
