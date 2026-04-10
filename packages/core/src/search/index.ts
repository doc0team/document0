import { create, insert, search } from "@orama/orama";
import type { SearchResult } from "../types.js";
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

const SEARCH_DB_KEY = "__searchDb";

async function getOrCreateDb(source: DocsSource) {
  const cached = source._cache.get(SEARCH_DB_KEY) as
    | ReturnType<typeof create>
    | undefined;
  if (cached) return cached;

  const db = create({
    schema: {
      title: "string",
      description: "string",
      content: "string",
      url: "string",
    } as const,
  });

  const pages = await source.getPages();
  for (const page of pages) {
    insert(db, {
      title: page.frontmatter.title ?? page.slug,
      description: page.frontmatter.description ?? "",
      content: stripMarkdown(page.content),
      url: page.url,
    });
  }

  source._cache.set(SEARCH_DB_KEY, db);
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
