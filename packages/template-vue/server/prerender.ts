import fs from "node:fs";
import path from "node:path";
import { DocsSource, buildPageTree, getBreadcrumbs, getPageNeighbours } from "@document0/core";
import { processMdc } from "@document0/mdc";
import { createHighlighter } from "shiki";

const rootDir = path.join(process.cwd(), "content/docs");
const outDir = path.join(process.cwd(), "dist/api");

const source = new DocsSource({ rootDir, baseUrl: "/docs" });

async function main() {
  const highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "typescript", "javascript", "tsx", "jsx",
      "bash", "sh", "json", "css", "html",
      "vue", "vue-html",
      "mdx", "markdown",
    ],
  });

  const tree = await buildPageTree(await source.getPages(), rootDir);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "tree.json"), JSON.stringify(tree));

  const pageDir = path.join(outDir, "page");
  fs.mkdirSync(pageDir, { recursive: true });

  const pages = await source.getPages();
  for (const page of pages) {
    const { body, toc } = await processMdc(page.content, {
      highlighter,
      frontmatter: page.frontmatter,
      content: page.content,
    });

    const breadcrumbs = getBreadcrumbs(tree, page.url);
    const { previous, next } = getPageNeighbours(tree, page.url);

    const slug = page.slugs.join("/") || "index";
    const segments = slug.split("/");

    if (segments.length > 1) {
      fs.mkdirSync(path.join(pageDir, ...segments.slice(0, -1)), { recursive: true });
    }

    fs.writeFileSync(
      path.join(pageDir, `${slug}.json`),
      JSON.stringify({
        title: page.frontmatter.title,
        description: page.frontmatter.description,
        body,
        toc,
        breadcrumbs,
        previous,
        next,
      })
    );
  }

  console.log(`Pre-rendered ${pages.length} pages to ${outDir}`);
  highlighter.dispose();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
