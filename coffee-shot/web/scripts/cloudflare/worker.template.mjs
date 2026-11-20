/**
 * Cloudflare Worker that serves the static export (out/) of the site from Workers KV.
 * deploy.mjs fills in BUILD and FILES and uploads this file; it is not run from the repo.
 *
 * Keys in KV are `${BUILD}/${path}`, so a deploy uploads the new build first and only then
 * switches the Worker to it: no visitor ever gets half of one build and half of another.
 */
const BUILD = "__BUILD__";
const FILES = new Set(__FILES__);

const TYPES = {
  html: "text/html; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  js: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8",
  json: "application/json",
  webmanifest: "application/manifest+json",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  ico: "image/x-icon",
  woff2: "font/woff2",
  woff: "font/woff",
};

function headersFor(key) {
  const ext = key.slice(key.lastIndexOf(".") + 1).toLowerCase();
  const cache = key.startsWith("_next/static/")
    ? "public, max-age=31536000, immutable"
    : ext === "html" || key.endsWith("-sw.js")
      ? "public, max-age=0, must-revalidate"
      : "public, max-age=3600";
  return {
    "content-type": TYPES[ext] ?? "application/octet-stream",
    "cache-control": cache,
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
  };
}

/** "/" → index.html, "/staff" → staff.html, "/a/b.png" → a/b.png. */
function resolve(pathname) {
  const rel = pathname.replace(/^\/+/, "");
  for (const key of rel === "" ? ["index.html"] : [rel, `${rel}.html`, `${rel}/index.html`]) {
    if (FILES.has(key)) return key;
  }
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }
    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      pathname = url.pathname;
    }
    // Clean URLs, the way Pages serves them: /staff.html and /staff/ both go to /staff.
    if (pathname.endsWith(".html") || (pathname.length > 1 && pathname.endsWith("/"))) {
      let clean = pathname.replace(/\/+$/, "").replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");
      if (clean === "") clean = "/";
      if (clean !== pathname) return Response.redirect(`${url.origin}${clean}${url.search}`, 308);
    }

    const key = resolve(pathname);
    const status = key ? 200 : 404;
    const servedKey = key ?? "404.html";
    const body = await env.SITE.get(`${BUILD}/${servedKey}`, { type: "arrayBuffer", cacheTtl: 86400 });
    if (body === null) return new Response("Not found", { status: 404 });
    const headers = headersFor(servedKey);
    if (!key) headers["cache-control"] = "no-store";
    return new Response(request.method === "HEAD" ? null : body, { status, headers });
  },
};
