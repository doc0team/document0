import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import {
  getRegistry,
  getItemBySlug,
  getItemSource,
  getItemId,
} from "@/lib/source";
import { getHighlighter, shikiThemes } from "@/lib/highlighter";
import { CopyButton } from "@/components/copy-button";
import {
  CliPreview,
  PluginSearch,
} from "@/components/plugins";
import { FumadocsIcon } from "@/components/ui/fumadocs-icon";

const previewComponents: Record<string, React.ComponentType> = {
  "document0/sidebar": dynamic(() => import("@/components/previews/sidebar").then((m) => m.SidebarPreview)),
  "document0/toc": dynamic(() => import("@/components/previews/toc").then((m) => m.TocPreview)),
  "document0/breadcrumbs": dynamic(() => import("@/components/previews/breadcrumbs").then((m) => m.BreadcrumbsPreview)),
  "document0/page-navigation": dynamic(() => import("@/components/previews/page-navigation").then((m) => m.PageNavigationPreview)),
  "document0/search-dialog": dynamic(() => import("@/components/previews/search-dialog").then((m) => m.SearchDialogPreview)),
  "fumadocs/steps": dynamic(() => import("@/components/previews/fumadocs-steps").then((m) => m.StepsPreview)),
  "fumadocs/files": dynamic(() => import("@/components/previews/fumadocs-files").then((m) => m.FilesPreview)),
  "fumadocs/tabs": dynamic(() => import("@/components/previews/fumadocs-tabs").then((m) => m.TabsPreview)),
  "fumadocs/accordion": dynamic(() => import("@/components/previews/fumadocs-accordion").then((m) => m.AccordionPreview)),
  "fumadocs/banner": dynamic(() => import("@/components/previews/fumadocs-banner").then((m) => m.BannerPreview)),
  "fumadocs/codeblock": dynamic(() => import("@/components/previews/fumadocs-codeblock").then((m) => m.CodeBlockPreview)),
};

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const registry = getRegistry();
  return [
    { slug: [] },
    ...registry.items.map((item) => ({
      slug: [item.namespace, item.name],
    })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return {
      title: "Plugins & Components",
      description: "Extend document0 with community plugins and UI components.",
    };
  }

  if (slug.length < 2) return {};

  const item = getItemBySlug(slug[0]!, slug[1]!);
  if (!item) return {};

  return {
    title: `${item.namespace}/${item.name}`,
    description: item.description,
  };
}

function PluginsIndexPage() {
  const registry = getRegistry();
  const items = registry.items.map((p) => ({
    name: p.name,
    namespace: p.namespace,
    description: p.description,
    category: p.category as "mdx" | "core" | "ui",
    tags: p.tags,
    frameworks: p.frameworks,
    author: p.author,
  }));

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
          Plugins & Components
        </h1>
        <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
          Extend document0 with plugins and pre-built UI components. Install source code directly.
          No npm dependencies, full customization, zero lock-in.
        </p>
      </div>

      <div className="mb-10">
        <CliPreview />
      </div>

      <PluginSearch plugins={items} />
    </div>
  );
}

const VUE_PREVIEW_BASE = process.env.VUE_PREVIEW_URL || "http://localhost:3002";

function ItemDetailPage({
  item,
  highlightedSource,
  highlightedUsage,
  sourceCode,
  PreviewComponent,
}: {
  item: NonNullable<ReturnType<typeof getItemBySlug>>;
  highlightedSource: string | null;
  highlightedUsage: string;
  sourceCode: string | null;
  PreviewComponent: React.ComponentType | null;
}) {
  const fullId = getItemId(item);
  const installCommand = `npx @document0/cli add ${fullId}`;
  const deps = Object.entries(item.dependencies);
  const isUi = item.category === "ui";
  const fileName = item.files[0] || "index.ts";

  return (
    <div className="prose-headless">
      <div className="not-prose flex items-center gap-4 mb-2">
        {item.namespace === "fumadocs" ? (
          <FumadocsIcon className="size-10" />
        ) : item.logo ? (
          <img
            src={item.logo}
            alt={`${item.namespace} logo`}
            className="size-10 rounded-lg"
          />
        ) : null}
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{item.name}</h1>
          <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {item.category}
          </span>
        </div>
      </div>

      <p>{item.description}</p>

      <div className="not-prose my-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
        <span>{fullId}</span>
        <span>•</span>
        <span>v{item.version}</span>
        <span>•</span>
        <span>
          {item.frameworks.includes("any")
            ? "Any framework"
            : item.frameworks.join(", ")}
        </span>
      </div>

      {(PreviewComponent || (item.preview && item.framework === "vue")) && (
        <>
          <h2>Preview</h2>
          <div className="not-prose mb-6 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-zinc-800 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              {item.framework === "vue" && (
                <span className="ml-auto text-xs text-zinc-500 font-medium">Vue</span>
              )}
            </div>
            {item.framework === "vue" ? (
              <iframe
                src={`${VUE_PREVIEW_BASE}/preview/${item.namespace}/${item.name}`}
                className="w-full border-0"
                style={{ minHeight: "200px" }}
                title={`${item.namespace}/${item.name} preview`}
              />
            ) : PreviewComponent ? (
              <div className="p-6">
                <PreviewComponent />
              </div>
            ) : null}
          </div>
        </>
      )}

      <h2>Installation</h2>
      <div className="not-prose rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 mb-4">
        <div className="flex items-center gap-3 font-mono text-sm text-zinc-300">
          <span className="text-zinc-500 select-none">$</span>
          <span className="flex-1">{installCommand}</span>
          <CopyButton text={installCommand} />
        </div>
      </div>

      {deps.length > 0 && (
        <p className="text-sm text-zinc-500">
          This will also install: {deps.map(([name, version]) => `${name}@${version}`).join(", ")}
        </p>
      )}

      <h2>Usage</h2>
      <div className="code-block-wrapper relative group not-prose">
        <CopyButton
          text={isUi ? getUiUsageCode(item.name, item.installPath, fileName) : getPluginUsageCode(item.name, item.installPath)}
          className="opacity-0 group-hover:opacity-100"
        />
        <div dangerouslySetInnerHTML={{ __html: highlightedUsage }} />
      </div>

      <h2>Source</h2>
      <p>
        After installation, this lives at{" "}
        <code>{item.installPath}/{fileName}</code> and you can modify it however you like.
      </p>
      {sourceCode && highlightedSource && (
        <div className="code-block-wrapper relative group not-prose">
          <CopyButton text={sourceCode} className="opacity-0 group-hover:opacity-100" />
          <div dangerouslySetInnerHTML={{ __html: highlightedSource }} />
        </div>
      )}

      <h2>Tags</h2>
      <div className="not-prose flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-800/80 px-2 py-1 text-xs text-zinc-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function getPluginUsageCode(name: string, installPath: string): string {
  const fnName = name.replace(/-./g, (m) => m[1].toUpperCase());
  return `import { processMdx } from "@document0/mdx";
import { ${fnName} } from "./${installPath}";

const result = await processMdx(source, {
  plugins: [${fnName}()],
});`;
}

function getUiUsageCode(name: string, installPath: string, fileName: string, framework?: string): string {
  const componentName = fileName.replace(".tsx", "").replace(".ts", "").replace(".vue", "");
  if (framework === "vue") {
    return `<script setup lang="ts">
import ${componentName} from "./${installPath}/${fileName}";
</script>

<template>
  <${componentName} />
</template>`;
  }
  return `import { ${componentName} } from "./${installPath}";

// Example usage in your layout or page:
<${componentName} />`;
}

export default async function PluginPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return (
      <div className="px-8 py-12 max-w-screen-xl mx-auto w-full">
        <PluginsIndexPage />
      </div>
    );
  }

  // Slug is [namespace, name]
  if (slug.length < 2) notFound();

  const [namespace, name] = slug;
  const item = getItemBySlug(namespace!, name!);
  if (!item) notFound();

  const sourceCode = getItemSource(namespace!, name!);
  const highlighter = await getHighlighter();

  let highlightedSource: string | null = null;
  if (sourceCode) {
    const sourceLang = item.framework === "vue" ? "vue" : "tsx";
    highlightedSource = highlighter.codeToHtml(sourceCode, {
      lang: sourceLang,
      themes: shikiThemes,
      defaultColor: false,
    });
  }

  const isUi = item.category === "ui";
  const fileName = item.files[0] || "index.ts";
  const usageCode = isUi
    ? getUiUsageCode(item.name, item.installPath, fileName, item.framework)
    : getPluginUsageCode(item.name, item.installPath);

  const highlightedUsage = highlighter.codeToHtml(usageCode, {
    lang: item.framework === "vue" ? "vue" : "tsx",
    themes: shikiThemes,
    defaultColor: false,
  });

  const fullId = getItemId(item);
  const PreviewComponent = item.preview ? previewComponents[fullId] || null : null;

  return (
    <div className="flex gap-12 px-8 py-10 max-w-screen-xl mx-auto w-full">
      <article className="flex-1 min-w-0 max-w-3xl pb-[50vh]">
        <ItemDetailPage
          item={item}
          highlightedSource={highlightedSource}
          highlightedUsage={highlightedUsage}
          sourceCode={sourceCode}
          PreviewComponent={PreviewComponent}
        />
      </article>
    </div>
  );
}
