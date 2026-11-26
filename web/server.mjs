// Railway server for the static site (web/out) plus a tiny in-memory relay for the demo.
//
// Demo cards live in the browser that created them. When the barista scans one from
// another phone, /staff asks this relay to forward the stamp to the phone showing the
// card; that phone stamps it (same as "Be the barista") and answers with the new count.
//
//   GET  /api/demo/listen?ch=FLW-XXXX   card holder subscribes (Server-Sent Events)
//   POST /api/demo/request              { ch, action: "stamp" | "redeem", location }  → waits for the answer
//   POST /api/demo/respond              { id, result }                               ← card holder answers
//
// Nothing is stored: one process, one memory, gone on restart. Demo data only.

import http from "node:http";
import crypto from "node:crypto";
import handler from "serve-handler";

const PORT = Number(process.env.PORT) || 8080;
const CH = /^FLW-[A-Z0-9]{4,16}$/;
const MAX_BODY = 4096;
const WAIT_MS = 6000;

/** ch → Set of SSE responses */
const listeners = new Map();
/** request id → { res, timer } */
const pending = new Map();

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
};

function readJson(req) {
  return new Promise((resolve) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        resolve(null);
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}

function listen(req, res, ch) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-store",
    connection: "keep-alive",
    "x-accel-buffering": "no",
  });
  res.write("retry: 2000\n\n");
  let set = listeners.get(ch);
  if (!set) listeners.set(ch, (set = new Set()));
  if (set.size >= 5) {
    // one card, a handful of open tabs at most
    const oldest = set.values().next().value;
    oldest.end();
    set.delete(oldest);
  }
  set.add(res);
  const beat = setInterval(() => res.write(": beat\n\n"), 20000);
  req.on("close", () => {
    clearInterval(beat);
    set.delete(res);
    if (!set.size) listeners.delete(ch);
  });
}

async function request(req, res) {
  const b = await readJson(req);
  const ch = typeof b?.ch === "string" ? b.ch.toUpperCase() : "";
  const action = b?.action === "redeem" ? "redeem" : b?.action === "stamp" ? "stamp" : null;
  const location = typeof b?.location === "string" ? b.location.slice(0, 32) : null;
  if (!CH.test(ch) || !action) return json(res, 400, { error: "Send ch and action." });
  const set = listeners.get(ch);
  if (!set?.size) return json(res, 404, { error: "offline" });
  const id = crypto.randomUUID();
  const timer = setTimeout(() => {
    pending.delete(id);
    json(res, 504, { error: "timeout" });
  }, WAIT_MS);
  pending.set(id, { res, timer });
  // barista's request dropped (tab closed, network): forget it
  res.on("close", () => {
    if (!res.writableEnded) {
      clearTimeout(timer);
      pending.delete(id);
    }
  });
  // only one open tab answers: the first one to respond wins, the rest are ignored
  const msg = `data: ${JSON.stringify({ id, action, location })}\n\n`;
  for (const l of set) l.write(msg);
}

async function respond(req, res) {
  const b = await readJson(req);
  const p = typeof b?.id === "string" ? pending.get(b.id) : null;
  if (!p) return json(res, 404, { error: "unknown or late" });
  clearTimeout(p.timer);
  pending.delete(b.id);
  json(p.res, 200, b.result ?? {});
  json(res, 200, { ok: true });
}

const staticOptions = {
  public: "out",
  cleanUrls: true,
  headers: [
    { source: "_next/static/**", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    {
      source: "**",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Robots-Tag", value: "noindex" },
      ],
    },
  ],
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    try {
      if (url.pathname === "/api/demo/listen" && req.method === "GET") {
        const ch = (url.searchParams.get("ch") ?? "").toUpperCase();
        return CH.test(ch) ? listen(req, res, ch) : json(res, 400, { error: "Bad channel." });
      }
      if (url.pathname === "/api/demo/request" && req.method === "POST") return await request(req, res);
      if (url.pathname === "/api/demo/respond" && req.method === "POST") return await respond(req, res);
      if (url.pathname.startsWith("/api/")) return json(res, 404, { error: "Not here: the wallet API is a separate service." });
      return handler(req, res, staticOptions);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) json(res, 500, { error: "Server error." });
    }
  })
  .listen(PORT, "0.0.0.0", () => console.log(`Fallow site on :${PORT}`));
