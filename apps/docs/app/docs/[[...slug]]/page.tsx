import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import fs from "node:fs";
import { source, getPageTree } from "@/lib/source";
import { getHighlighter, shikiThemes } from "@/lib/highlighter";
import { processMdx } from "@document0/mdx";
import { getBreadcrumbs, getPageNeighbours } from "@document0/core";
import { Breadcrumbs } from "../../../../../registry/ui/document0/breadcrumbs/Breadcrumbs";
import { PageNavigation } from "../../../../../registry/ui/document0/page-navigation/PageNavigation";
import { TableOfContents } from "../../../../../registry/ui/document0/toc/TableOfContents";
import { mdxComponents } from "@/components/mdx-components";
import { readingTime } from "@/plugins/reading-time";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: page.slugs.filter(Boolean),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug ? slug.join("/") : "";
  const page = source.getPage(slugStr);
  if (!page) return {};
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug ? slug.join("/") : "";
  const page = source.getPage(slugStr);
  if (!page) notFound();

  const raw = fs.readFileSync(page.filePath, "utf-8");
  const highlighter = await getHighlighter();
  const result = await processMdx(raw, {
    highlighter,
    themes: shikiThemes,
    plugins: [readingTime()],
  });
  const { code, toc } = result;
  const readingTimeMinutes = result.readingTime as number;

  const { default: MDXContent } = await run(code, {
    ...(runtime as object),
    baseUrl: import.meta.url,
  } as Parameters<typeof run>[1]);

  const tree = getPageTree();
  const breadcrumbs = getBreadcrumbs(tree, page.url);
  const { previous, next } = getPageNeighbours(tree, page.url);

  return (
    <div>
      <div className="flex gap-12 px-8 py-10 max-w-screen-xl mx-auto w-full">
        <article className="flex-1 min-w-0 max-w-3xl pb-[50vh]">
          {breadcrumbs.length > 1 && <Breadcrumbs items={breadcrumbs} />}
          <div className="mb-4 text-sm text-zinc-500">
            {readingTimeMinutes} min read
          </div>
          <div className="prose-headless">
            <MDXContent components={mdxComponents} />
          </div>
          <PageNavigation previous={previous} next={next} />
        </article>
        {toc.length > 0 && (
          <aside className="hidden xl:block w-56 shrink-0">
            <TableOfContents toc={toc} />
          </aside>
        )}
      </div>
    </div>
  );
}
