import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@document0/core", "@document0/mdx", "shiki", "@scalar/openapi-parser"],
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/internal/mdx/:path*",
      },
    ];
  },
};

export default nextConfig;
