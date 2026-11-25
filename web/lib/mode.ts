/**
 * The site is a static export (Cloudflare Pages). Club actions go to the wallet API
 * (backend/fallow-wallet, on Railway) when NEXT_PUBLIC_API_URL is set at build time;
 * otherwise everything runs as a local simulation in the browser.
 * NEXT_PUBLIC_FORCE_DEMO=1 forces demo mode even with the URL set.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export function clubLive() {
  return Boolean(API_URL) && process.env.NEXT_PUBLIC_FORCE_DEMO !== "1";
}

export const api = (path: string) => `${API_URL}${path}`;
