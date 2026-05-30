import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@humanberto/ui", "@humanberto/advocate-agent"],
  experimental: {
    optimizePackageImports: ["@humanberto/ui"],
  },
};

export default nextConfig;
