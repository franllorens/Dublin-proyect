/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    // Wallet libraries run only in route handlers; keep them out of the bundler.
    serverComponentsExternalPackages: ["passkit-generator", "google-auth-library", "jsonwebtoken"],
  },
};
export default nextConfig;
