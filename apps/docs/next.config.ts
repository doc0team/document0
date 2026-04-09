import type { NextConfig } from "next";
import { withDocument0 } from "@document0/next-dev";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@document0/core",
    "@document0/mdx",
    "@scalar/openapi-parser",
  ],
  webpack(config: any) {
    // Shiki ships `.d.mts` type-declaration files that webpack cannot parse.
    // Tell webpack to treat them as empty modules so the dynamic
    // `import("shiki/bundle/web")` in AiChat.tsx resolves at runtime only.
    config.module ??= {};
    config.module.rules ??= [];
    config.module.rules.push({
      test: /\.d\.m?ts$/,
      type: "javascript/auto" as const,
      use: "null-loader",
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*.mdx",
        destination: "/internal/mdx/:path*",
      },
    ];
  },
};

export default withDocument0({ contentDir: "content/docs" })(nextConfig);
