import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import matter from "gray-matter";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import type { CompileOptions } from "@mdx-js/mdx";
import { rehypeShiki, rehypeStripShikiStyle, type RehypeShikiThemes } from "./plugins/rehype-shiki.js";
import { remarkToc, type TocEntry } from "./plugins/remark-toc.js";

export interface HtmlProcessorOptions {
  highlighter?: HighlighterGeneric<BundledLanguage, BundledTheme>;
  defaultLanguage?: string;
  themes?: RehypeShikiThemes;
  remarkPlugins?: CompileOptions["remarkPlugins"];
  rehypePlugins?: CompileOptions["rehypePlugins"];
}

export interface ProcessedHtml {
  html: string;
  frontmatter: Record<string, unknown>;
  toc: TocEntry[];
}

/**
 * Compile markdown/MDX source directly to HTML.
 *
 * Unlike `processMdx` (which outputs JSX requiring React), this function
 * produces a self-contained HTML string using the unified pipeline:
 *   remark-parse → rehype → rehype-stringify
 *
 * Same Shiki highlighting, GFM tables, TOC extraction — zero React dependency.
 */
export async function processMdxToHtml(
  source: string,
  options: HtmlProcessorOptions = {},
): Promise<ProcessedHtml> {
  const { data: frontmatter, content } = matter(source);
  const toc: TocEntry[] = [];

  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkToc, { onToc: (entries: TocEntry[]) => toc.push(...entries) });

  if (options.remarkPlugins) {
    for (const plugin of options.remarkPlugins) {
      if (Array.isArray(plugin)) {
        processor.use(plugin[0] as Parameters<typeof processor.use>[0], plugin[1]);
      } else {
        processor.use(plugin as Parameters<typeof processor.use>[0]);
      }
    }
  }

  processor.use(remarkRehype, { allowDangerousHtml: true });
  processor.use(rehypeSlug);

  if (options.highlighter) {
    processor.use(rehypeShiki as unknown as Parameters<typeof processor.use>[0], {
      highlighter: options.highlighter,
      defaultLanguage: options.defaultLanguage ?? "plaintext",
      themes: options.themes,
    });
    processor.use(rehypeStripShikiStyle as unknown as Parameters<typeof processor.use>[0]);
  }

  if (options.rehypePlugins) {
    for (const plugin of options.rehypePlugins) {
      if (Array.isArray(plugin)) {
        processor.use(plugin[0] as Parameters<typeof processor.use>[0], plugin[1]);
      } else {
        processor.use(plugin as Parameters<typeof processor.use>[0]);
      }
    }
  }

  processor.use(rehypeStringify, { allowDangerousHtml: true });

  const result = await processor.process(content);

  return {
    html: String(result),
    frontmatter,
    toc,
  };
}
