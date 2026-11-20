/**
 * Options for the static build (STATIC_EXPORT=1, npm run build:static), merged in by
 * next.config.mjs. They live in this file because Railway's builder reads next.config.mjs
 * and, when it finds an export output there, builds the service as a static site instead
 * of the Node app.
 */
export const staticExport = {
  output: "export",
  // No image optimizer without a server: serve the originals.
  images: { unoptimized: true },
  // Route handlers are route.ts; pages and layouts are .tsx. Dropping "ts" leaves the API out.
  // (Two entries on purpose: Next 14 passes a one-item list to its app loader as a string.)
  pageExtensions: ["tsx", "jsx"],
};
