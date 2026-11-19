/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Wallet libraries run only in route handlers; keep them out of the bundler.
    serverComponentsExternalPackages: ["passkit-generator", "google-auth-library", "jsonwebtoken"],
  },
  // The home page is a static page built with the taste-skill kit (public/index.html + public/assets).
  // The club card, the full menu, the barista and owner views and the API stay Next.js routes.
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/index.html" }] };
  },
};
export default nextConfig;
