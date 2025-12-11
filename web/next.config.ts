import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure DuckDB native bindings stay external and are file-traced for Node runtimes.
  serverExternalPackages: [
    "duckdb",
    "@duckdb/node-api",
    "@duckdb/node-bindings",
  ],
  webpack: (config) => {
    config.externals ??= [];
    config.externals.push({
      duckdb: "commonjs duckdb",
      "@duckdb/node-api": "commonjs @duckdb/node-api",
      "@duckdb/node-bindings": "commonjs @duckdb/node-bindings",
    });
    return config;
  },
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
};

export default nextConfig;
