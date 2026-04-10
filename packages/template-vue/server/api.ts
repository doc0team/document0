import path from "node:path";
import fs from "node:fs";
import { DocsSource, buildPageTree, getBreadcrumbs, getPageNeighbours } from "@document0/core";
import { processMdc } from "@document0/mdc";
import { createHighlighter, type HighlighterGeneric, type BundledLanguage, type BundledTheme } from "shiki";
import type { Plugin } from "vite";

const rootDir = path.join(process.cwd(), "content/docs");

const source = new DocsSource({
  rootDir,
  baseUrl: "/docs",
});

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null;

async function getHighlighter() {
  if (highlighter) return highlighter;
  highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "typescript", "javascript", "tsx", "jsx",
      "bash", "sh", "json", "css", "html",
      "vue", "vue-html",
      "mdx", "markdown",
    ],
  });
  return highlighter;
}

async function getTree() {
  return buildPageTree(await source.getPages(), rootDir);
}

async function getPage(slug: string) {
  const page = await source.getPage(slug);
  if (!page) return null;

  const raw = fs.readFileSync(page.filePath, "utf-8");
  const hl = await getHighlighter();
  const { body, toc } = await processMdc(raw, { highlighter: hl });

  const tree = await getTree();
  const breadcrumbs = getBreadcrumbs(tree, page.url);
  const { previous, next } = getPageNeighbours(tree, page.url);

  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
    body,
    toc,
    breadcrumbs,
    previous,
    next,
  };
}

export function document0ApiPlugin(): Plugin {
  return {
    name: "document0-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === "/api/tree") {
          const tree = await getTree();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(tree));
          return;
        }

        const pageMatch = req.url?.match(/^\/api\/page\/(.*)$/);
        if (pageMatch) {
          const slug = decodeURIComponent(pageMatch[1]);
          try {
            const data = await getPage(slug);
            if (!data) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "Not found" }));
              return;
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (err: unknown) {
            console.error("Error rendering page:", slug, err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
          return;
        }

        next();
      });
    },
  };
}

export { getTree, getPage };
