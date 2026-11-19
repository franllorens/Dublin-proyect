import { db, getPassView, PassView } from "./db";
import { pushAppleUpdate } from "./apple";
import { updateGoogleObject } from "./google";

export type StampSource = "scan" | "welcome" | "story" | "referral" | "bonus";

export type StampResult =
  | { ok: true; pass: PassView; message: string }
  | { ok: false; reason: "not_found" | "cooldown" | "card_full" | "story_limit"; message: string };

type Ctx = { tenantSlug: string; locationId?: string; staffId?: string };

async function locationsOf(tenantId: string) {
  const { data, error } = await db().from("locations").select("lat,lng,name").eq("tenant_id", tenantId);
  if (error) throw error;
  return (data ?? []).filter((l: { lat: number | null }) => l.lat != null) as {
    lat: number;
    lng: number;
    name: string;
  }[];
}

/** Sends the new state to both wallets. Failures are logged, never block the barista. */
async function syncWallets(p: PassView, tenantSlug: string) {
  const locs = await locationsOf(p.tenant_id);
  await Promise.allSettled([pushAppleUpdate(p.serial), updateGoogleObject(p, tenantSlug, locs)]).then((rs) =>
    rs.forEach((r) => r.status === "rejected" && console.error("wallet sync failed", r.reason)),
  );
}

export async function addStamp(serial: string, source: StampSource, ctx: Ctx): Promise<StampResult> {
  const p = await getPassView(serial);
  if (!p) return { ok: false, reason: "not_found", message: "This card isn't in the club. Ask them to scan the QR to join." };
  if (p.reward_ready) return { ok: false, reason: "card_full", message: `${p.first_name} has a free coffee waiting. Redeem it first.` };

  if (source === "scan" && p.last_stamp_at) {
    const mins = (Date.now() - new Date(p.last_stamp_at).getTime()) / 60000;
    if (mins < p.rules.cooldownMinutes) {
      return { ok: false, reason: "cooldown", message: `Already stamped ${Math.floor(mins)} min ago. One stamp every ${p.rules.cooldownMinutes} minutes.` };
    }
  }

  if (source === "story") {
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const { count, error } = await db()
      .from("stamp_events")
      .select("id", { count: "exact", head: true })
      .eq("serial", serial)
      .eq("source", "story")
      .gte("created_at", weekAgo);
    if (error) throw error;
    if ((count ?? 0) >= p.rules.storyPerWeek) {
      return { ok: false, reason: "story_limit", message: "Story stamp already given this week." };
    }
  }

  const stamps = Math.min(p.rules.goal, p.stamps + 1);
  const reward = stamps >= p.rules.goal;
  const now = new Date().toISOString();

  const ins = await db().from("stamp_events").insert({
    serial,
    source,
    location_id: ctx.locationId ?? null,
    staff_id: ctx.staffId ?? null,
  });
  if (ins.error) throw ins.error;
  // Optimistic guard: only apply if nobody stamped in between
  const upd = await db()
    .from("passes")
    .update({ stamps, reward_ready: reward, last_stamp_at: source === "scan" ? now : p.last_stamp_at, updated_at: now })
    .eq("serial", serial)
    .eq("updated_at", p.updated_at)
    .select()
    .maybeSingle();
  if (upd.error) throw upd.error;
  if (!upd.data) return addStamp(serial, source, ctx); // lost a race; re-read and retry

  const next: PassView = { ...p, stamps, reward_ready: reward, updated_at: now };
  await syncWallets(next, ctx.tenantSlug);
  return {
    ok: true,
    pass: next,
    message: reward ? `${p.first_name} · ${stamps}/${p.rules.goal} · free coffee unlocked` : `${p.first_name} · +1 · ${stamps}/${p.rules.goal}`,
  };
}

export async function redeem(serial: string, ctx: Ctx): Promise<StampResult> {
  const p = await getPassView(serial);
  if (!p) return { ok: false, reason: "not_found", message: "Card not found." };
  if (!p.reward_ready) return { ok: false, reason: "card_full", message: `${p.first_name} has ${p.stamps}/${p.rules.goal}. Nothing to redeem yet.` };
  const now = new Date().toISOString();
  const r = await db().from("redemptions").insert({ serial, location_id: ctx.locationId ?? null, staff_id: ctx.staffId ?? null });
  if (r.error) throw r.error;
  const u = await db().from("passes").update({ stamps: 0, reward_ready: false, updated_at: now }).eq("serial", serial);
  if (u.error) throw u.error;
  const next: PassView = { ...p, stamps: 0, reward_ready: false, updated_at: now };
  await syncWallets(next, ctx.tenantSlug);
  return { ok: true, pass: next, message: `Redeemed. ${p.first_name}'s card starts again.` };
}

export { locationsOf };
