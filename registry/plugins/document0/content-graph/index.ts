export interface LinkInfo {
  /** Slug of the page containing the link. */
  from: string;
  /** Resolved URL the link points to. */
  to: string;
  /** The original href as written in markdown. */
  raw: string;
}

export interface ContentGraph {
  /** All outgoing links from a page. */
  getLinks(slug: string): LinkInfo[];
  /** All pages that link to a given page (by slug). */
  getBacklinks(slug: string): LinkInfo[];
  /** Internal links pointing to pages that don't exist. */
  getBrokenLinks(): LinkInfo[];
  /** Every internal link in the graph. */
  getAllLinks(): LinkInfo[];
}

interface PageLike {
  slug: string;
  url: string;
  content: string;
}

const LINK_RE = /\[(?:[^\]]*)\]\(([^)]+)\)/g;

function extractHrefs(content: string): string[] {
  const hrefs: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = LINK_RE.exec(content)) !== null) {
    const href = match[1]!.split(/[#?]/)[0]!.trim();
    if (href) hrefs.push(href);
  }
  return hrefs;
}

function isInternal(href: string): boolean {
  if (href.startsWith("http://") || href.startsWith("https://")) return false;
  if (href.startsWith("mailto:")) return false;
  return href.startsWith("/") || href.startsWith("./") || href.startsWith("../");
}

function resolveHref(href: string, pageUrl: string): string {
  if (href.startsWith("/")) return href;
  const base = pageUrl.replace(/\/[^/]*$/, "");
  const parts = `${base}/${href}`.split("/");
  const resolved: string[] = [];
  for (const part of parts) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }
  return resolved.join("/") || "/";
}

function normalizeUrl(url: string): string {
  return url.replace(/\.(mdx?|md)$/, "").replace(/\/index$/, "");
}

/**
 * Build a content graph from an array of pages.
 *
 * ```ts
 * import { buildContentGraph } from "./plugins/content-graph";
 * const graph = buildContentGraph(await source.getPages());
 * graph.getBacklinks("getting-started");
 * graph.getBrokenLinks();
 * ```
 */
export function buildContentGraph(pages: PageLike[]): ContentGraph {
  const urlSet = new Set(pages.map((p) => p.url));
  const slugToUrl = new Map(pages.map((p) => [p.slug, p.url]));

  const links: LinkInfo[] = [];
  const linksByFrom = new Map<string, LinkInfo[]>();
  const linksByTo = new Map<string, LinkInfo[]>();
  const broken: LinkInfo[] = [];

  for (const page of pages) {
    const hrefs = extractHrefs(page.content);
    for (const raw of hrefs) {
      if (!isInternal(raw)) continue;
      const resolved = normalizeUrl(resolveHref(raw, page.url));
      const info: LinkInfo = { from: page.slug, to: resolved, raw };
      links.push(info);

      let fromBucket = linksByFrom.get(page.slug);
      if (!fromBucket) {
        fromBucket = [];
        linksByFrom.set(page.slug, fromBucket);
      }
      fromBucket.push(info);

      let toBucket = linksByTo.get(resolved);
      if (!toBucket) {
        toBucket = [];
        linksByTo.set(resolved, toBucket);
      }
      toBucket.push(info);

      if (!urlSet.has(resolved)) {
        broken.push(info);
      }
    }
  }

  return {
    getLinks(slug: string): LinkInfo[] {
      return linksByFrom.get(slug) ?? [];
    },
    getBacklinks(slug: string): LinkInfo[] {
      const url = slugToUrl.get(slug);
      if (!url) return [];
      return linksByTo.get(url) ?? [];
    },
    getBrokenLinks(): LinkInfo[] {
      return broken;
    },
    getAllLinks(): LinkInfo[] {
      return [...links];
    },
  };
}
