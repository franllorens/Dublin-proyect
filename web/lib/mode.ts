import "server-only";

/**
 * "live" when the wallet backend is configured; otherwise every club action runs as a
 * local simulation. NEXT_PUBLIC_FORCE_DEMO=1 forces demo mode even with env vars set.
 */
export function clubLive() {
  if (process.env.NEXT_PUBLIC_FORCE_DEMO === "1") return false;
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.APP_BASE_URL);
}
