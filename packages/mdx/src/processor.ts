import { compile } from "@mdx-js/mdx";
import type { TocEntry } from "./plugins/remark-toc.js";
import { parseFrontmatter, buildRemarkPlugins, buildRehypePlugins, type BaseProcessorOptions } from "./shared.js";

/**
 * Structurally compatible with Document0Plugin from @document0/core.
 * Defined locally so @document0/mdx has no hard dependency on core.
 */
export interface ProcessorPlugin {
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
  transformResult?: (
    result: ProcessedMdx & Record<string, unknown>,
    context: { source: string; content: string },
  ) => ProcessedMdx & Record<string, unknown>;
}

export interface ProcessorOptions extends BaseProcessorOptions {
  /**
   * Whether to output automatic or classic JSX runtime.
   * @default "automatic"
   */
  jsxRuntime?: "automatic" | "classic";
  /**
   * Document0 plugins. Each plugin can contribute remark/rehype plugins
   * and post-process the compiled result.
   */
  plugins?: ProcessorPlugin[];
}

export interface ProcessedMdx {
  code: string;
  frontmatter: Record<string, unknown>;
  toc: TocEntry[];
  [key: string]: unknown;
}

export async function processMdx(
  source: string,
  options: ProcessorOptions = {},
): Promise<ProcessedMdx> {
  const plugins = options.plugins ?? [];
  const { frontmatter, content } = parseFrontmatter(source, options);

  const toc: TocEntry[] = [];

  const pluginRemark = plugins.flatMap((p) => p.remarkPlugins ?? []);
  const pluginRehype = plugins.flatMap((p) => p.rehypePlugins ?? []);

  const remarkPlugins = buildRemarkPlugins(
    options,
    (entries: TocEntry[]) => toc.push(...entries),
    pluginRemark,
  );

  const rehypePlugins = buildRehypePlugins(options, pluginRehype);

  const compiled = await compile(content, {
    outputFormat: "function-body",
    development: false,
    jsxRuntime: options.jsxRuntime ?? "automatic",
    remarkPlugins,
    rehypePlugins,
  });

  let result: ProcessedMdx = {
    code: String(compiled),
    frontmatter,
    toc,
  };

  const ctx = { source, content };
  for (const plugin of plugins) {
    if (plugin.transformResult) {
      result = plugin.transformResult(result, ctx) as ProcessedMdx;
    }
  }

  return result;
}
