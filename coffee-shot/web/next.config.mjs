import { staticExport } from "./next.static.mjs";

/**
 * STATIC_EXPORT=1 (npm run build:static) builds the demo-mode site as plain files in out/
 * for Cloudflare (npm run deploy:cloudflare): no route handlers (the Wallet API stays on the
 * Node server) and no image optimizer. Without it this is the normal Node build that Railway runs.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Wallet libraries run only in route handlers; keep them out of the bundler.
    serverComponentsExternalPackages: ["passkit-generator", "google-auth-library", "jsonwebtoken"],
  },
  ...(isStatic && staticExport),
};
export default nextConfig;
