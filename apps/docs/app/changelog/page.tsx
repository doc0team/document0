import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { processMdxToHtml } from "@document0/mdx";
import { getHighlighter, shikiThemes } from "@/lib/highlighter";
import {
  parseChangelogMarkdown,
  formatChangelogSidebarDate,
  splitReleaseSummary,
} from "@/lib/changelog";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Release history for document0 — sourced from the repository CHANGELOG.md.",
};

const CHANGELOG_MD = path.join(process.cwd(), "..", "..", "CHANGELOG.md");

export default async function ChangelogPage() {
  if (!fs.existsSync(CHANGELOG_MD)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
        <SiteHeader current="changelog" />
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
          <p className="text-xs text-zinc-500">Changelog file was not found.</p>
        </div>
      </div>
    );
  }

  const full = fs.readFileSync(CHANGELOG_MD, "utf-8");
  const { preambleMd, releases } = parseChangelogMarkdown(full);
  const highlighter = await getHighlighter();
  const htmlOpts = { highlighter, themes: shikiThemes } as const;

  // Skip rendering the preamble since it contains markdown instructions, not changelog content.
  const preambleHtml = "";
  
  // Filter out the Unreleased section so it only stays in the markdown file
  const publishedReleases = releases.filter((r) => r.version !== "Unreleased");

  const releaseBlocks = await Promise.all(
    publishedReleases.map(async (r) => {
      const { summaryMd, restMd } = splitReleaseSummary(r.bodyMd);
      const [summaryHtml, bodyHtml] = await Promise.all([
        summaryMd
          ? processMdxToHtml(summaryMd, htmlOpts).then((x) => x.html)
          : Promise.resolve(""),
        restMd.length > 0
          ? processMdxToHtml(restMd, htmlOpts).then((x) => x.html)
          : Promise.resolve(""),
      ]);
      return {
        ...r,
        summaryHtml,
        bodyHtml,
      };
    }),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <SiteHeader current="changelog" />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <header className="mb-12 border-b border-zinc-800 pb-10">
          <h1
            className="mb-3 text-lg font-medium tracking-tight text-white"
            style={{ fontFamily: "var(--font-geist-pixel-square)" }}
          >
            Changelog
          </h1>
          <p className="text-[11px] leading-relaxed text-zinc-500">
            Source:{" "}
            <code className="rounded bg-zinc-900 px-1 py-0.5 font-mono text-[10px] text-zinc-400">
              CHANGELOG.md
            </code>
          </p>
          {preambleHtml ? (
            <div
              className="changelog-preamble mt-6"
              dangerouslySetInnerHTML={{ __html: preambleHtml }}
            />
          ) : null}
        </header>

        <div className="flex flex-col gap-0">
          {releaseBlocks.map((r, i) => (
            <article
              key={`${i}-${r.version}-${r.dateIso ?? ""}`}
              className="grid grid-cols-1 gap-8 border-b border-zinc-800 py-10 last:border-b-0 md:grid-cols-[minmax(0,140px)_minmax(0,1fr)] md:gap-10"
            >
              <aside className="md:border-r md:border-zinc-800 md:pr-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {formatChangelogSidebarDate(r.version, r.dateIso)}
                </p>
                <p
                  className="mt-2 text-sm font-semibold text-white"
                  style={{ fontFamily: "var(--font-geist-pixel-square)" }}
                >
                  {r.version === "Unreleased"
                    ? "Unreleased"
                    : `v${r.version}`}
                </p>
                {r.summaryHtml ? (
                  <div
                    className="changelog-release-summary mt-4"
                    dangerouslySetInnerHTML={{ __html: r.summaryHtml }}
                  />
                ) : null}
              </aside>
              <div
                className="changelog-release-body min-w-0"
                dangerouslySetInnerHTML={{ __html: r.bodyHtml }}
              />
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
