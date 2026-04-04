import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  serverExternalPackages: ["@document0/core", "@document0/mdx", "shiki"],
};

export default nextConfig;
