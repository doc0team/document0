import type { NextConfig } from "next";
import { withDocument0 } from "@document0/next-dev";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  serverExternalPackages: ["@document0/core", "@document0/mdx", "shiki"],
};

export default withDocument0({ contentDir: "content/docs" })(nextConfig);
