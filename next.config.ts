import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker (.next/standalone).
  output: "standalone",
  // Keep server-only queue deps out of the bundle. bullmq lazily requires an
  // optional valkey-glide client that isn't installed; externalizing lets it
  // resolve ioredis at runtime instead of failing the build bundle.
  serverExternalPackages: ["bullmq", "ioredis"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/webp", "image/avif"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
