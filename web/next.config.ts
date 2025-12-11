import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow builds to proceed even if third-party packages have type issues
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  // Exclude native modules from bundling (duckdb has native bindings)
  serverExternalPackages: ["@duckdb/node-api"],
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
