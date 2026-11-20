/**
 * STATIC_EXPORT=1 (npm run build:static) builds the demo-mode site as plain files in out/
 * for Cloudflare (npm run deploy:cloudflare): no route handlers (the Wallet API stays on the Node server) and
 * no image optimizer. Without it this is the normal Node build that Railway runs.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: staticExport ? { unoptimized: true } : { formats: ["image/avif", "image/webp"] },
  ...(staticExport && {
    output: "export",
    // Route handlers are route.ts; pages and layouts are .tsx. Dropping "ts" leaves the API out.
    // (Two entries on purpose: Next 14 passes a one-item list to its app loader as a string.)
    pageExtensions: ["tsx", "jsx"],
  }),
  experimental: {
    // Wallet libraries run only in route handlers; keep them out of the bundler.
    serverComponentsExternalPackages: ["passkit-generator", "google-auth-library", "jsonwebtoken"],
  },
};
export default nextConfig;
