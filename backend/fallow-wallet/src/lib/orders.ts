import { db } from "./db";

export type OrderStatus = "received" | "making" | "ready" | "collected";
const FLOW: OrderStatus[] = ["received", "making", "ready", "collected"];

type Line =
  | { kind: "drink"; name: string; temp: "hot" | "iced"; milk: "regular" | "oat" | "coconut"; extraShot: boolean; syrup: "none" | "vanilla" | "caramel" | "hazelnut"; qty: number }
  | { kind: "snack"; name: string; qty: number };

const str = (v: unknown, max = 60) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const oneOf = <T extends string>(v: unknown, opts: readonly T[]) => (opts.includes(v as T) ? (v as T) : null);

/** Accepts only the shapes the site sends; anything else is dropped. */
export function cleanLines(raw: unknown): Line[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 8) return null;
  const out: Line[] = [];
  for (const r of raw as Record<string, unknown>[]) {
    const name = str(r?.name);
    const qty = Number(r?.qty);
    if (!name || !Number.isInteger(qty) || qty < 1 || qty > 6) return null;
    if (r.kind === "snack") out.push({ kind: "snack", name, qty });
    else if (r.kind === "drink") {
      const temp = oneOf(r.temp, ["hot", "iced"] as const);
      const milk = oneOf(r.milk, ["regular", "oat", "coconut"] as const);
      const syrup = oneOf(r.syrup, ["none", "vanilla", "caramel", "hazelnut"] as const);
      if (!temp || !milk || !syrup) return null;
      out.push({ kind: "drink", name, temp, milk, extraShot: r.extraShot === true, syrup, qty });
    } else return null;
  }
  return out;
}

type Row = {
  id: string;
  number: string;
  name: string;
  lines: Line[];
  pickup_at_min: number;
  asap: boolean;
  status: OrderStatus;
  created_at: string;
  locations: { slug: string };
};

/** Same shape as web/lib/order.ts → Order. */
export const toOrder = (r: Row) => ({
  id: r.id,
  number: r.number,
  location: r.locations.slug,
  name: r.name,
  lines: r.lines,
  pickupAt: r.pickup_at_min,
  asap: r.asap,
  status: r.status,
  createdAt: new Date(r.created_at).getTime(),
});

// A day of service is 07:00–15:30, so "today" = the last 16 hours.
const sinceToday = () => new Date(Date.now() - 16 * 3600e3).toISOString();

export async function createOrder(input: { tenantSlug: string; locationSlug: string; name: string; lines: Line[]; pickupAt: number; asap: boolean }) {
  const { data: loc, error: lErr } = await db()
    .from("locations")
    .select("id, slug, tenant_id, tenants!inner(slug)")
    .eq("slug", input.locationSlug)
    .eq("tenants.slug", input.tenantSlug)
    .maybeSingle();
  if (lErr) throw lErr;
  if (!loc) return null;
  const { count, error: cErr } = await db()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("location_id", loc.id)
    .gte("created_at", sinceToday());
  if (cErr) throw cErr;
  // MVP numbering: two orders in the same instant could share a number; the name tells them apart.
  const number = `${loc.slug.charAt(0).toUpperCase()}-${String((count ?? 0) + 1).padStart(2, "0")}`;
  const { data, error } = await db()
    .from("orders")
    .insert({
      tenant_id: loc.tenant_id,
      location_id: loc.id,
      number,
      name: input.name,
      lines: input.lines,
      pickup_at_min: input.pickupAt,
      asap: input.asap,
    })
    .select("id, number, status")
    .single();
  if (error) throw error;
  return data as { id: string; number: string; status: OrderStatus };
}

export async function orderStatus(id: string) {
  const { data, error } = await db().from("orders").select("number, status").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as { number: string; status: OrderStatus } | null;
}

export async function queueFor(locationId: string) {
  const { data, error } = await db()
    .from("orders")
    .select("id, number, name, lines, pickup_at_min, asap, status, created_at, locations(slug)")
    .eq("location_id", locationId)
    .neq("status", "collected")
    .gte("created_at", sinceToday())
    .order("pickup_at_min", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as Row[]).map(toOrder);
}

/** Forward-only status change, and only for orders at the barista's own hatch. */
export async function advanceOrder(id: string, locationId: string, to: OrderStatus) {
  const { data: o, error } = await db().from("orders").select("status, location_id").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!o || o.location_id !== locationId) return { ok: false as const, reason: "not_found" };
  if (FLOW.indexOf(to) <= FLOW.indexOf(o.status as OrderStatus)) return { ok: false as const, reason: "stale" };
  const u = await db().from("orders").update({ status: to, updated_at: new Date().toISOString() }).eq("id", id);
  if (u.error) throw u.error;
  return { ok: true as const, status: to };
}
