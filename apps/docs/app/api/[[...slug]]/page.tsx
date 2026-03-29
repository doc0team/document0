import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApiPages } from "@/lib/source";
import { APIPage } from "@/components/api-page";
import type { OpenAPIPageData } from "@document0/core";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const pages = await getApiPages();
  return [
    { slug: undefined },
    ...pages.map((op) => ({ slug: [op.slug] })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    return { title: "API Reference" };
  }
  const pages = await getApiPages();
  const op = pages.find((p) => p.slug === slug.join("/"));
  if (!op) return {};
  return {
    title: `${op.method} ${op.path} - ${op.summary}`,
    description: op.description ?? op.summary,
  };
}

function groupByTag(pages: OpenAPIPageData[]) {
  const groups: Record<string, OpenAPIPageData[]> = {};
  for (const page of pages) {
    const tag = page.tags[0] ?? "Other";
    if (!groups[tag]) groups[tag] = [];
    groups[tag]!.push(page);
  }
  return groups;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500/15 text-emerald-400",
  POST: "bg-sky-500/15 text-sky-400",
  PUT: "bg-amber-500/15 text-amber-400",
  PATCH: "bg-orange-500/15 text-orange-400",
  DELETE: "bg-red-500/15 text-red-400",
};

export default async function ApiPage({ params }: PageProps) {
  const { slug } = await params;
  const pages = await getApiPages();

  if (!slug || slug.length === 0) {
    const groups = groupByTag(pages);
    return (
      <div className="px-8 py-10 max-w-screen-xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-white mb-2">API Reference</h1>
        <p className="text-zinc-400 mb-8">
          Browse all available API endpoints and their documentation.
        </p>
        {Object.entries(groups).map(([tag, ops]) => (
          <div key={tag} className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              {tag}
            </h2>
            <div className="space-y-1.5">
              {ops.map((op) => (
                <Link
                  key={op.slug}
                  href={op.url}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors"
                >
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${METHOD_COLORS[op.method] ?? METHOD_COLORS.GET}`}
                  >
                    {op.method}
                  </span>
                  <code className="text-sm font-mono text-zinc-300">{op.path}</code>
                  <span className="text-sm text-zinc-500 ml-auto hidden sm:inline truncate max-w-[300px]">
                    {op.summary}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const slugStr = slug.join("/");
  const operation = pages.find((p) => p.slug === slugStr);
  if (!operation) notFound();

  return (
    <div className="px-8 py-10 max-w-screen-xl mx-auto w-full">
      <article className="max-w-3xl">
        <APIPage operation={operation} />
      </article>
    </div>
  );
}
