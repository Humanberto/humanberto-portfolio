import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@humanberto/ui", "@humanberto/advocate-agent"],
  experimental: {
    optimizePackageImports: ["@humanberto/ui"],
  },
  async redirects() {
    return [
      { source: "/build", destination: "/studio", permanent: true },
    ];
  },
};

export default nextConfig;
