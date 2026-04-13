import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

export interface WithDocument0Options {
  /**
   * Directory with your docs (`.md` / `.mdx` / `_meta.json`), relative to the Next
   * project root (the `dir` Next passes to webpack).
   * @default "content/docs"
   */
  contentDir?: string;
}

/** This module compiles to `dist/with-document0.js` — package root is one level up. */
function getPackageRoot(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
}

function getContentStampModulePath(): string {
  return path.join(getPackageRoot(), "dist", "content-stamp.js");
}

function getLoaderPath(): string {
  return path.join(getPackageRoot(), "loaders", "content-stamp-loader.cjs");
}

/**
 * Next.js integration: wires **development** content edits to webpack invalidation
 * so `DocsSource` modules re-run (Fumadocs-style), without a sidecar or refresh route.
 *
 * - Wrap your config: `export default withDocument0()(nextConfig)`
 * - Import once: `import "@document0/next-dev/content-stamp"` next to your `DocsSource`
 *
 * Uses **webpack** only. If you run `next dev --turbo`, use `next dev` or
 * `next dev --webpack` so custom webpack runs.
 */
export function withDocument0(
  options: WithDocument0Options = {},
): (nextConfig: NextConfig) => NextConfig {
  const { contentDir = "content/docs" } = options;

  return (nextConfig) => ({
    ...nextConfig,
    webpack(config, webpackContext) {
      let cfg =
        typeof nextConfig.webpack === "function"
          ? nextConfig.webpack(config, webpackContext)
          : config;

      const { dir, isServer, dev } = webpackContext;
      const isDev = dev ?? process.env.NODE_ENV !== "production";
      const absContent = path.resolve(dir, contentDir);
      const stampModule = getContentStampModulePath();

      if (isDev && isServer) {
        cfg.module ??= {};
        cfg.module.rules ??= [];
        cfg.module.rules.push({
          enforce: "pre",
          test: (resourcePath: string) =>
            path.normalize(resourcePath) === path.normalize(stampModule),
          use: [
            {
              loader: getLoaderPath(),
              options: { contentDir: absContent },
            },
          ],
        });
      }

      return cfg;
    },
  });
}
