import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["shiki", "@shikijs/core", "@shikijs/rehype"],
  serverExternalPackages: ["@document0/core", "@document0/mdx", "@scalar/openapi-parser"],
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
