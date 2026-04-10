import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdc from "remark-mdc";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import matter from "gray-matter";
import type { Root } from "hast";
import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import { rehypeShiki, rehypeStripShikiStyle, type RehypeShikiThemes } from "./plugins/rehype-shiki.js";
import { compileHastToMdc, extractToc } from "./compiler.js";
import type { ProcessedMdc, ProcessedMdcHtml } from "./types.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPlugin = any;

export interface MdcProcessorOptions {
  highlighter?: HighlighterGeneric<BundledLanguage, BundledTheme>;
  defaultLanguage?: string;
  themes?: RehypeShikiThemes;
  remarkPlugins?: unknown[];
  rehypePlugins?: unknown[];
}

type FrozenProcessor = ReturnType<typeof unified>;

const mdcCache = new WeakMap<object, FrozenProcessor>();
const mdcHtmlCache = new WeakMap<object, FrozenProcessor>();
const NO_HL = Symbol("no-highlighter");

function buildMdcProcessor(options: MdcProcessorOptions): FrozenProcessor {
  const proc = unified();
  proc.use(remarkParse);
  proc.use(remarkMdc as AnyPlugin);
  proc.use(remarkGfm);

  if (options.remarkPlugins) {
    for (const plugin of options.remarkPlugins) {
      if (Array.isArray(plugin)) proc.use(plugin[0] as AnyPlugin, plugin[1]);
      else proc.use(plugin as AnyPlugin);
    }
  }

  proc.use(remarkRehype, { allowDangerousHtml: true });
  proc.use(rehypeRaw as AnyPlugin);
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

  return proc;
}

function getCachedProcessor(
  cache: WeakMap<object, FrozenProcessor>,
  options: MdcProcessorOptions,
  build: (options: MdcProcessorOptions) => FrozenProcessor,
): FrozenProcessor {
  const key = (options.highlighter ?? NO_HL) as object;
  if (!options.remarkPlugins?.length && !options.rehypePlugins?.length) {
    const cached = cache.get(key);
    if (cached) return cached;
    const proc = build(options);
    cache.set(key, proc);
    return proc;
  }
  return build(options);
}

/**
 * Parse MDC source into a JSON AST suitable for Vue rendering.
 *
 * The AST contains `MdcNode` objects where custom component tags
 * (e.g. `callout`, `tabs`) are preserved, allowing a Vue renderer
 * to resolve them against a component map.
 */
export async function processMdc(
  source: string,
  options: MdcProcessorOptions = {},
): Promise<ProcessedMdc> {
  const { data: frontmatter, content } = matter(source);

  const proc = getCachedProcessor(mdcCache, options, buildMdcProcessor);

  const mdast = proc.parse(content);
  const hast = (await proc.run(mdast)) as Root;

  const toc = extractToc(hast);
  const body = compileHastToMdc(hast);

  return { body, frontmatter, toc };
}

/**
 * Parse MDC source directly to an HTML string.
 *
 * Custom components are rendered as HTML custom elements
 * (e.g. `<callout type="warning">...</callout>`).
 * Useful for simple rendering or SSR without a component map.
 */
export async function processMdcToHtml(
  source: string,
  options: MdcProcessorOptions = {},
): Promise<ProcessedMdcHtml> {
  const { data: frontmatter, content } = matter(source);

  const proc = getCachedProcessor(mdcHtmlCache, options, (opts) => {
    const p = buildMdcProcessor(opts);
    p.use(rehypeStringify as AnyPlugin, { allowDangerousHtml: true });
    return p;
  });

  const mdast = proc.parse(content);
  const hast = (await proc.run(mdast)) as Root;

  const toc = extractToc(hast);
  const html = proc.stringify(hast);

  return {
    html: String(html),
    frontmatter,
    toc,
  };
}
