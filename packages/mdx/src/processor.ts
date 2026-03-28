import { compile, type CompileOptions } from "@mdx-js/mdx";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import { rehypeShiki, rehypeStripShikiStyle, type RehypeShikiThemes } from "./plugins/rehype-shiki.js";
import { remarkToc, type TocEntry } from "./plugins/remark-toc.js";

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

export interface ProcessorOptions {
  /**
   * Shiki highlighter instance. Create with `createHighlighter` from shiki.
   * If omitted, code blocks will not be syntax-highlighted.
   */
  highlighter?: HighlighterGeneric<BundledLanguage, BundledTheme>;
  /**
   * Default language for code blocks without a specified language.
   * @default "plaintext"
   */
  defaultLanguage?: string;
  /**
   * Shiki themes: `{ light, dark }` for dual-theme CSS variable output.
   * Defaults to `{ light: "github-light", dark: "github-dark" }`.
   */
  themes?: RehypeShikiThemes;
  /**
   * Additional remark plugins to apply.
   */
  remarkPlugins?: CompileOptions["remarkPlugins"];
  /**
   * Additional rehype plugins to apply.
   */
  rehypePlugins?: CompileOptions["rehypePlugins"];
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
  const { data: frontmatter, content } = matter(source);

  const toc: TocEntry[] = [];

  const pluginRemark = plugins.flatMap((p) => p.remarkPlugins ?? []);
  const pluginRehype = plugins.flatMap((p) => p.rehypePlugins ?? []);

  const remarkPlugins: CompileOptions["remarkPlugins"] = [
    remarkFrontmatter,
    remarkGfm,
    [remarkToc, { onToc: (entries: TocEntry[]) => toc.push(...entries) }],
    ...(options.remarkPlugins ?? []),
    ...(pluginRemark as CompileOptions["remarkPlugins"] & unknown[]),
  ];

  const rehypePlugins: CompileOptions["rehypePlugins"] = [
    rehypeSlug,
    ...(options.highlighter
      ? [
          [
            rehypeShiki,
            {
              highlighter: options.highlighter,
              defaultLanguage: options.defaultLanguage ?? "plaintext",
              themes: options.themes,
            },
          ] as never,
          rehypeStripShikiStyle as never,
        ]
      : []),
    ...(options.rehypePlugins ?? []),
    ...(pluginRehype as CompileOptions["rehypePlugins"] & unknown[]),
  ];

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
