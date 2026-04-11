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
  /**
   * Pre-parsed frontmatter. When provided together with `content`,
   * `gray-matter` parsing is skipped.
   */
  frontmatter?: Record<string, unknown>;
  /**
   * Pre-parsed content (frontmatter already stripped).
   * When provided together with `frontmatter`, `gray-matter` parsing is skipped.
   */
  content?: string;
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPlugin = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FrozenProcessor = ReturnType<typeof unified> & { process: any; parse: any; run: any; stringify: any };

const htmlCache = new WeakMap<object, { proc: FrozenProcessor; tocRef: TocEntry[] }>();
const NO_HL = Symbol("no-highlighter");

function buildHtmlProcessor(options: HtmlProcessorOptions): { proc: FrozenProcessor; tocRef: TocEntry[] } {
  const tocRef: TocEntry[] = [];

  const proc = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkToc, { onToc: (entries: TocEntry[]) => { tocRef.length = 0; tocRef.push(...entries); } });

  if (options.remarkPlugins) {
    for (const plugin of options.remarkPlugins) {
      if (Array.isArray(plugin)) proc.use(plugin[0] as AnyPlugin, plugin[1]);
      else proc.use(plugin as AnyPlugin);
    }
  }

  proc.use(remarkRehype, { allowDangerousHtml: true });
  proc.use(rehypeSlug);

  if (options.highlighter) {
    proc.use(rehypeShiki as AnyPlugin, {
      highlighter: options.highlighter,
      defaultLanguage: options.defaultLanguage ?? "plaintext",
      themes: options.themes,
    });
    proc.use(rehypeStripShikiStyle as AnyPlugin);
  }

  if (options.rehypePlugins) {
    for (const plugin of options.rehypePlugins) {
      if (Array.isArray(plugin)) proc.use(plugin[0] as AnyPlugin, plugin[1]);
      else proc.use(plugin as AnyPlugin);
    }
  }

  proc.use(rehypeStringify, { allowDangerousHtml: true });

  return { proc: proc as unknown as FrozenProcessor, tocRef };
}

function getCachedHtmlProcessor(options: HtmlProcessorOptions): { proc: FrozenProcessor; tocRef: TocEntry[] } {
  const key = (options.highlighter ?? NO_HL) as object;
  if (!options.remarkPlugins?.length && !options.rehypePlugins?.length) {
    const cached = htmlCache.get(key);
    if (cached) return cached;
    const entry = buildHtmlProcessor(options);
    htmlCache.set(key, entry);
    return entry;
  }
  return buildHtmlProcessor(options);
}

export async function processMdxToHtml(
  source: string,
  options: HtmlProcessorOptions = {},
): Promise<ProcessedHtml> {
  let frontmatter: Record<string, unknown>;
  let content: string;
  if (options.frontmatter !== undefined && options.content !== undefined) {
    frontmatter = options.frontmatter;
    content = options.content;
  } else {
    const parsed = matter(source);
    frontmatter = parsed.data;
    content = parsed.content;
  }

  const { proc, tocRef } = getCachedHtmlProcessor(options);
  const result = await proc.process(content);

  return {
    html: String(result),
    frontmatter,
    toc: [...tocRef],
  };
}
