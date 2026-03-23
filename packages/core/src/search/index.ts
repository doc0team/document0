import { create, insert, search } from "@orama/orama";
import type { PageData, SearchIndex, SearchResult } from "../types.js";
import type { DocsSource } from "../source/index.js";

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s*[-*+>]\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .trim();
}

// --- Orama-backed search ---

interface SearchRouteOptions {
  language?: string;
}

let cachedDb: Awaited<ReturnType<typeof create>> | null = null;
let cachedSourceRef: DocsSource | null = null;

async function getOrCreateDb(source: DocsSource) {
  if (cachedDb && cachedSourceRef === source) return cachedDb;

  const db = create({
    schema: {
      title: "string",
      description: "string",
      content: "string",
      url: "string",
    } as const,
  });

  const pages = source.getPages();
  for (const page of pages) {
    insert(db, {
      title: page.frontmatter.title ?? page.slug,
      description: page.frontmatter.description ?? "",
      content: stripMarkdown(page.content),
      url: page.url,
    });
  }

  cachedDb = db;
  cachedSourceRef = source;
  return db;
}

export function createSearchRoute(
  source: DocsSource,
  _options?: SearchRouteOptions
) {
  return {
    async GET(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const query = url.searchParams.get("q") ?? "";

      if (!query.trim()) {
        return Response.json([]);
      }

      const db = await getOrCreateDb(source);
      const results = await search(db, {
        term: query,
        limit: 10,
        threshold: 0,
      });

      const mapped: SearchResult[] = results.hits.map((hit) => ({
        title: hit.document.title as string,
        description: (hit.document.description as string) || undefined,
        url: hit.document.url as string,
        score: hit.score,
      }));

      return Response.json(mapped);
    },
  };
}

// --- Legacy API (backward compat) ---

export function buildSearchIndex(pages: PageData[]): SearchIndex[] {
  return pages.map((page) => ({
    id: page.slug || "index",
    title: page.frontmatter.title ?? page.slug,
    description: page.frontmatter.description,
    url: page.url,
    content: stripMarkdown(page.content),
  }));
}

export function searchPages(
  index: SearchIndex[],
  query: string
): SearchIndex[] {
  const lower = query.toLowerCase().trim();
  if (!lower) return [];

  return index
    .map((entry) => {
      const titleMatch = entry.title.toLowerCase().includes(lower);
      const contentMatch = entry.content.toLowerCase().includes(lower);
      const descriptionMatch =
        entry.description?.toLowerCase().includes(lower) ?? false;

      const score =
        (titleMatch ? 3 : 0) +
        (descriptionMatch ? 2 : 0) +
        (contentMatch ? 1 : 0);
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}
