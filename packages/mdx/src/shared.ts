import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeSlug from "rehype-slug";
import type { CompileOptions } from "@mdx-js/mdx";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import { rehypeShiki, rehypeStripShikiStyle, type RehypeShikiThemes } from "./plugins/rehype-shiki.js";
import { remarkToc, type TocEntry } from "./plugins/remark-toc.js";

export interface BaseProcessorOptions {
  highlighter?: HighlighterGeneric<BundledLanguage, BundledTheme>;
  defaultLanguage?: string;
  themes?: RehypeShikiThemes;
  remarkPlugins?: CompileOptions["remarkPlugins"];
  rehypePlugins?: CompileOptions["rehypePlugins"];
  frontmatter?: Record<string, unknown>;
  content?: string;
}

export function parseFrontmatter(
  source: string,
  options: BaseProcessorOptions,
): { frontmatter: Record<string, unknown>; content: string } {
  if (options.frontmatter !== undefined && options.content !== undefined) {
    return { frontmatter: options.frontmatter, content: options.content };
  }
  const parsed = matter(source);
  return { frontmatter: parsed.data, content: parsed.content };
}

export function buildRemarkPlugins(
  options: BaseProcessorOptions,
  tocCallback: (entries: TocEntry[]) => void,
  extraRemark?: unknown[],
): CompileOptions["remarkPlugins"] {
  return [
    remarkFrontmatter,
    remarkGfm,
    [remarkToc, { onToc: tocCallback }],
    ...(options.remarkPlugins ?? []),
    ...(extraRemark as CompileOptions["remarkPlugins"] & unknown[] ?? []),
  ];
}

export function buildRehypePlugins(
  options: BaseProcessorOptions,
  extraRehype?: unknown[],
): CompileOptions["rehypePlugins"] {
  return [
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
    ...(extraRehype as CompileOptions["rehypePlugins"] & unknown[] ?? []),
  ];
}
