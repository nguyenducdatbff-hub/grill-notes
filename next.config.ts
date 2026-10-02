import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel's Next.js 16.3 adapter does not support standalone output.
  // Keep standalone for Docker/self-hosting, where it is still required.
  output: process.env.VERCEL ? undefined : "standalone",
  reactStrictMode: true,
};

export default nextConfig;
