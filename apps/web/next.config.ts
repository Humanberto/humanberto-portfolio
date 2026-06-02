import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@humanberto/ui", "@humanberto/advocate-agent"],
  experimental: {
    optimizePackageImports: ["@humanberto/ui"],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "humanberto-portfolio-web.vercel.app" }],
        destination: "https://humanberto.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
