import fs from "node:fs";
import type { DocsSource } from "../source/index.js";

export interface LlmsOptions {
  title: string;
  description?: string;
  /** Full origin URL, e.g. "https://docs.example.com" */
  baseUrl: string;
}

function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

/**
 * Generates `llms.txt` content — a concise index of all pages
 * following the llms.txt specification.
 */
export function generateLlmsTxt(
  source: DocsSource,
  options: LlmsOptions
): string {
  const pages = source.getPages();
  const lines: string[] = [];

  lines.push(`# ${options.title}`);
  if (options.description) {
    lines.push("", `> ${options.description}`);
  }

  lines.push("", "## Docs", "");

  for (const page of pages) {
    const url = `${options.baseUrl}${page.url}`;
    const title = page.frontmatter.title ?? page.slug;
    const desc = page.frontmatter.description;
    if (desc) {
      lines.push(`- [${title}](${url}): ${desc}`);
    } else {
      lines.push(`- [${title}](${url})`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Generates `llms-full.txt` — the complete content of every page
 * concatenated into a single text file for full-context ingestion.
 */
export function generateLlmsFullTxt(
  source: DocsSource,
  options: LlmsOptions
): string {
  const pages = source.getPages();
  const sections: string[] = [];

  sections.push(`# ${options.title}`);
  if (options.description) {
    sections.push("", `> ${options.description}`);
  }

  for (const page of pages) {
    const url = `${options.baseUrl}${page.url}`;
    const title = page.frontmatter.title ?? page.slug;
    const raw = fs.readFileSync(page.filePath, "utf-8");
    const content = stripFrontmatter(raw).trim();

    sections.push(
      "",
      "---",
      "",
      `# ${title}`,
      `URL: ${url}`,
      "",
      content
    );
  }

  sections.push("");
  return sections.join("\n");
}

/**
 * Returns the raw MDX/MD content for a single page by slug,
 * with frontmatter stripped.
 */
export function getPageRawContent(
  source: DocsSource,
  slug: string
): string | null {
  const page = source.getPage(slug);
  if (!page) return null;
  const raw = fs.readFileSync(page.filePath, "utf-8");
  return stripFrontmatter(raw).trim();
}

// --- Route helpers ---

export function createLlmsTxtRoute(source: DocsSource, options: LlmsOptions) {
  return {
    GET(): Response {
      const body = generateLlmsTxt(source, options);
      return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    },
  };
}

export function createLlmsFullTxtRoute(
  source: DocsSource,
  options: LlmsOptions
) {
  return {
    GET(): Response {
      const body = generateLlmsFullTxt(source, options);
      return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    },
  };
}

export function createMdxPageRoute(source: DocsSource) {
  return {
    GET(
      _request: Request,
      { params }: { params: { slug?: string[] } }
    ): Response {
      const slug = params.slug?.join("/") ?? "";
      const content = getPageRawContent(source, slug);

      if (!content) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(content, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    },
  };
}
