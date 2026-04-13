import type { DocsSource } from "../source/index.js";

export interface LlmsOptions {
  title: string;
  description?: string;
  /** Full origin URL, e.g. "https://docs.example.com" */
  baseUrl: string;
}

/**
 * Generates `llms.txt` content - a concise index of all pages
 * following the llms.txt specification.
 */
export async function generateLlmsTxt(
  source: DocsSource,
  options: LlmsOptions
): Promise<string> {
  const pages = await source.getPages();
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
 * Generates `llms-full.txt` - the complete content of every page
 * concatenated into a single text file for full-context ingestion.
 */
export async function generateLlmsFullTxt(
  source: DocsSource,
  options: LlmsOptions
): Promise<string> {
  const pages = await source.getPages();
  const sections: string[] = [];

  sections.push(`# ${options.title}`);
  if (options.description) {
    sections.push("", `> ${options.description}`);
  }

  for (const page of pages) {
    const url = `${options.baseUrl}${page.url}`;
    const title = page.frontmatter.title ?? page.slug;
    const content = page.content.trim();

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
export async function getPageRawContent(
  source: DocsSource,
  slug: string
): Promise<string | null> {
  const page = await source.getPage(slug);
  if (!page) return null;
  return page.content.trim();
}

// --- Route helpers ---

export function createLlmsTxtRoute(source: DocsSource, options: LlmsOptions) {
  return {
    async GET(): Promise<Response> {
      const body = await generateLlmsTxt(source, options);
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
    async GET(): Promise<Response> {
      const body = await generateLlmsFullTxt(source, options);
      return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    },
  };
}

export function createMdxPageRoute(source: DocsSource) {
  return {
    async GET(
      _request: Request,
      { params }: { params: { slug?: string[] } }
    ): Promise<Response> {
      const slug = params.slug?.join("/") ?? "";
      const content = await getPageRawContent(source, slug);

      if (!content) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(content, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    },
  };
}
