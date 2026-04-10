import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import fs from "node:fs";
import { source, getPageTree } from "@/lib/source";
import { getHighlighter } from "@/lib/highlighter";
import { processMdx } from "@document0/mdx";
import { getBreadcrumbs, getPageNeighbours } from "@document0/core";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageNavigation } from "@/components/page-navigation";
import { TableOfContents } from "@/components/table-of-contents";
import { mdxComponents } from "@/components/mdx-components";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  return (await source.getPages()).map((page) => ({
    slug: page.slugs.filter(Boolean),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugStr = slug ? slug.join("/") : "";
  const page = await source.getPage(slugStr);
  if (!page) return {};
  return {
    title: page.frontmatter.title,
    description: page.frontmatter.description,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug ? slug.join("/") : "";
  const page = await source.getPage(slugStr);
  if (!page) notFound();

  const raw = fs.readFileSync(page.filePath, "utf-8");
  const highlighter = await getHighlighter();
  const { code, toc } = await processMdx(raw, { highlighter });

  const { default: MDXContent } = await run(code, {
    ...(runtime as object),
    baseUrl: import.meta.url,
  } as Parameters<typeof run>[1]);

  const tree = await getPageTree();
  const breadcrumbs = getBreadcrumbs(tree, page.url);
  const { previous, next } = getPageNeighbours(tree, page.url);

  return (
    <div className="flex gap-8 px-6 py-8 max-w-5xl mx-auto w-full">
      <article className="flex-1 min-w-0 max-w-3xl">
        {breadcrumbs.length > 1 && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {page.frontmatter.title}
        </h1>
        {page.frontmatter.description && (
          <p className="text-muted-foreground mb-8">
            {page.frontmatter.description}
          </p>
        )}
        <div>
          <MDXContent components={mdxComponents} />
        </div>
        <PageNavigation previous={previous} next={next} />
      </article>
      {toc.length > 0 && <TableOfContents toc={toc} />}
    </div>
  );
}
