/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages: `npm run build` writes ./out
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // No image server on Pages: the photos in assets/ are pre-sized (see README).
  images: { unoptimized: true },
};
export default nextConfig;
