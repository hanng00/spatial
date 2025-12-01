import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
