import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { TocEntry } from "./plugins/remark-toc.js";
import { parseFrontmatter, buildRemarkPlugins, buildRehypePlugins, type BaseProcessorOptions } from "./shared.js";

export type HtmlProcessorOptions = BaseProcessorOptions;

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

  const remarkPlugins = buildRemarkPlugins(
    options,
    (entries: TocEntry[]) => { tocRef.length = 0; tocRef.push(...entries); },
  );
  const rehypePlugins = buildRehypePlugins(options);

  const proc = unified().use(remarkParse);

  for (const plugin of remarkPlugins ?? []) {
    if (Array.isArray(plugin)) proc.use(plugin[0] as AnyPlugin, plugin[1]);
    else proc.use(plugin as AnyPlugin);
  }

  proc.use(remarkRehype, { allowDangerousHtml: true });

  for (const plugin of rehypePlugins ?? []) {
    if (Array.isArray(plugin)) proc.use(plugin[0] as AnyPlugin, plugin[1]);
    else proc.use(plugin as AnyPlugin);
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
  const { frontmatter, content } = parseFrontmatter(source, options);

  const { proc, tocRef } = getCachedHtmlProcessor(options);
  const result = await proc.process(content);

  return {
    html: String(result),
    frontmatter,
    toc: [...tocRef],
  };
}
