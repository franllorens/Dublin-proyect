#!/usr/bin/env node
/**
 * Deploys the static export in out/ to Cloudflare as a Worker that reads the files from Workers KV.
 *
 *   npm run deploy:cloudflare        (builds with build:static first)
 *
 * Needs CLOUDFLARE_API_TOKEN with Workers Scripts: Edit and Workers KV Storage: Edit.
 * CLOUDFLARE_ACCOUNT_ID is optional when the token sees a single account.
 *
 * Why KV and not wrangler's static assets: wrangler uploads assets with a short-lived token of
 * its own, and the network proxy of a Claude Code cloud session replaces that header with the
 * saved API token, so the upload fails with 401. Every call here uses the API token itself,
 * so the same command works from a cloud session and from a computer.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WORKER = "the-coffee-shot";
const NAMESPACE = "the-coffee-shot-site";
const COMPAT_DATE = "2026-11-01";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const outDir = path.join(root, "out");
const API = "https://api.cloudflare.com/client/v4";
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!token) fail("Set CLOUDFLARE_API_TOKEN.");

function fail(msg) {
  console.error(`✘ ${msg}`);
  process.exit(1);
}

async function cf(method, route, body, headers = {}) {
  const res = await fetch(`${API}${route}`, {
    method,
    headers: { authorization: `Bearer ${token}`, ...headers },
    body,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    fail(`${method} ${route} → ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!res.ok || json.success === false) {
    fail(`${method} ${route} → ${res.status}: ${JSON.stringify(json.errors ?? json).slice(0, 500)}`);
  }
  return json;
}
const cfJson = (method, route, data) =>
  cf(method, route, JSON.stringify(data), { "content-type": "application/json" });

async function walk(dir, base = "") {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await walk(path.join(dir, entry.name), rel)));
    else out.push(rel);
  }
  return out;
}

// 1. Files and a build id that only changes when the content does.
let keys;
try {
  keys = (await walk(outDir)).sort();
} catch {
  fail("No out/ folder. Run npm run build:static first.");
}
if (!keys.includes("index.html")) fail("out/index.html is missing. Run npm run build:static first.");
const files = await Promise.all(keys.map(async (key) => ({ key, data: await readFile(path.join(outDir, key)) })));
const hash = createHash("sha256");
for (const f of files) hash.update(f.key).update("\0").update(f.data).update("\0");
const build = hash.digest("hex").slice(0, 12);
const bytes = files.reduce((n, f) => n + f.data.length, 0);
console.log(`• ${files.length} files, ${(bytes / 1e6).toFixed(2)} MB, build ${build}`);

// 2. Account.
let account = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!account) {
  const { result } = await cf("GET", "/accounts?per_page=50");
  if (result.length !== 1) fail(`The token sees ${result.length} accounts; set CLOUDFLARE_ACCOUNT_ID.`);
  account = result[0].id;
}
const A = `/accounts/${account}`;

// 3. KV namespace (created on the first deploy).
let ns;
for (let page = 1; !ns; page++) {
  const { result, result_info } = await cf("GET", `${A}/storage/kv/namespaces?per_page=100&page=${page}`);
  ns = result.find((n) => n.title === NAMESPACE)?.id;
  if (!result.length || page >= (result_info?.total_pages ?? 1)) break;
}
if (!ns) {
  ns = (await cfJson("POST", `${A}/storage/kv/namespaces`, { title: NAMESPACE })).result.id;
  console.log(`• Created KV namespace ${NAMESPACE}`);
}

// 4. Upload this build under its own prefix (batches stay well under the bulk API limits).
const batches = [[]];
let size = 0;
for (const f of files) {
  const b64 = f.data.toString("base64");
  if (batches.at(-1).length >= 5000 || size + b64.length > 50e6) {
    batches.push([]);
    size = 0;
  }
  batches.at(-1).push({ key: `${build}/${f.key}`, value: b64, base64: true });
  size += b64.length;
}
for (const batch of batches) await cfJson("PUT", `${A}/storage/kv/namespaces/${ns}/bulk`, batch);
console.log(`• Uploaded to KV`);

// 5. Upload the Worker pointed at this build.
const template = await readFile(path.join(here, "worker.template.mjs"), "utf8");
const source = template.replace('"__BUILD__"', JSON.stringify(build)).replace("__FILES__", JSON.stringify(keys));
const form = new FormData();
form.set(
  "metadata",
  JSON.stringify({
    main_module: "worker.mjs",
    compatibility_date: COMPAT_DATE,
    bindings: [{ type: "kv_namespace", name: "SITE", namespace_id: ns }],
  }),
);
form.set("worker.mjs", new Blob([source], { type: "application/javascript+module" }), "worker.mjs");
await cf("PUT", `${A}/workers/scripts/${WORKER}`, form);
await cfJson("POST", `${A}/workers/scripts/${WORKER}/subdomain`, { enabled: true, previews_enabled: false });
console.log(`• Worker ${WORKER} now serves build ${build}`);

// 6. Remove earlier builds.
const stale = [];
let cursor = "";
do {
  const q = new URLSearchParams({ limit: "1000", ...(cursor && { cursor }) });
  const { result, result_info } = await cf("GET", `${A}/storage/kv/namespaces/${ns}/keys?${q}`);
  for (const k of result) if (!k.name.startsWith(`${build}/`)) stale.push(k.name);
  cursor = result_info?.cursor ?? "";
} while (cursor);
for (let i = 0; i < stale.length; i += 5000) {
  await cfJson("POST", `${A}/storage/kv/namespaces/${ns}/bulk/delete`, stale.slice(i, i + 5000));
}
if (stale.length) console.log(`• Removed ${stale.length} files from earlier builds`);

// 7. Address.
const { result: sub } = await cf("GET", `${A}/workers/subdomain`);
console.log(`✓ https://${WORKER}.${sub.subdomain}.workers.dev`);
