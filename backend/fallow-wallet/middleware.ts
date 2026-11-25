import { NextRequest, NextResponse } from "next/server";

/**
 * CORS for the club API, so the static site (Cloudflare Pages) can call it.
 * CORS_ORIGINS: comma-separated list, e.g. "https://fallow-coffee.pages.dev,https://fallow.ie".
 * Apple's PassKit web service (/api/apple/*) is server-to-server and needs none.
 */
const allowed = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  const ok = allowed.includes(origin);
  const headers: Record<string, string> = ok
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      }
    : {};
  if (req.method === "OPTIONS") return new NextResponse(null, { status: ok ? 204 : 403, headers });
  const res = NextResponse.next();
  Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
  return res;
}

export const config = { matcher: ["/api/club/:path*", "/api/feedback"] };
