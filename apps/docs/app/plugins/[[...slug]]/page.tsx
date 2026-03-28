import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getRegistry,
  getPluginByName,
  getPluginSource,
} from "@/lib/source";
import { getHighlighter, shikiThemes } from "@/lib/highlighter";
import { CopyButton } from "@/components/copy-button";

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateStaticParams() {
  const registry = getRegistry();
  return [
    { slug: [] }, // /plugins (index)
    ...registry.plugins.map((plugin) => ({
      slug: [plugin.name],
    })),
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!slug || slug.length === 0) {
    return {
      title: "Plugins",
      description: "Extend document0 with community plugins.",
    };
  }

  const plugin = getPluginByName(slug[0]!);
  if (!plugin) return {};

  return {
    title: plugin.name,
    description: plugin.description,
  };
}

function PluginsIndexPage() {
  const registry = getRegistry();
  const mdxPlugins = registry.plugins.filter((p) => p.category === "mdx");
  const corePlugins = registry.plugins.filter((p) => p.category === "core");

  return (
    <div className="prose-headless">
      <h1>Plugins</h1>
      <p>
        Plugins extend document0 with additional features. Install them with the
        CLI or copy the source directly — you own the code.
      </p>

      <div className="not-prose my-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="flex items-center gap-3 font-mono text-sm text-zinc-300">
          <span className="text-zinc-500 select-none">$</span>
          <span>npx @document0/cli add admonitions</span>
          <CopyButton text="npx @document0/cli add admonitions" />
        </div>
      </div>

      <h2>How It Works</h2>
      <p>
        document0 plugins follow the{" "}
        <a href="https://ui.shadcn.com" target="_blank" rel="noopener noreferrer">
          shadcn/ui
        </a>{" "}
        model — you install the source code, not an npm dependency. This means
        you can customize anything and there&apos;s no dependency versioning to
        manage.
      </p>

      <h2>MDX Plugins</h2>
      <p>Extend the MDX compilation pipeline with remark or rehype plugins.</p>
      <table>
        <thead>
          <tr>
            <th>Plugin</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {mdxPlugins.map((plugin) => (
            <tr key={plugin.name}>
              <td>
                <a href={`/plugins/${plugin.name}`}>{plugin.name}</a>
              </td>
              <td>{plugin.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Core Plugins</h2>
      <p>
        Work with the data layer — transform pages, modify the page tree, or
        analyze content relationships.
      </p>
      <table>
        <thead>
          <tr>
            <th>Plugin</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {corePlugins.map((plugin) => (
            <tr key={plugin.name}>
              <td>
                <a href={`/plugins/${plugin.name}`}>{plugin.name}</a>
              </td>
              <td>{plugin.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>CLI Commands</h2>
      <pre>
        <code>{`# List all available plugins
npx @document0/cli list

# Search plugins
npx @document0/cli search callout

# Install plugins
npx @document0/cli add admonitions reading-time`}</code>
      </pre>
    </div>
  );
}

async function PluginDetailPage({
  plugin,
  highlightedSource,
  highlightedUsage,
}: {
  plugin: ReturnType<typeof getPluginByName> & {};
  highlightedSource: string | null;
  highlightedUsage: string;
}) {
  const sourceCode = getPluginSource(plugin.name);
  const installCommand = `npx @document0/cli add ${plugin.name}`;
  const deps = Object.entries(plugin.dependencies);

  return (
    <div className="prose-headless">
      <div className="not-prose flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-white">{plugin.name}</h1>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
            plugin.category === "mdx"
              ? "border-sky-500/30 text-sky-400 bg-sky-500/10"
              : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
          }`}
        >
          {plugin.category}
        </span>
      </div>

      <p>{plugin.description}</p>

      <div className="not-prose my-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
        <span>v{plugin.version}</span>
        <span>•</span>
        <span>by {plugin.author}</span>
        <span>•</span>
        <span>
          {plugin.frameworks.includes("any")
            ? "Works with any framework"
            : plugin.frameworks.join(", ")}
        </span>
      </div>

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
          text={`import { processMdx } from "@document0/mdx";
import { ${plugin.name.replace(/-/g, "")} } from "./${plugin.installPath}";

const result = await processMdx(source, {
  plugins: [${plugin.name.replace(/-/g, "")}()],
});`}
          className="opacity-0 group-hover:opacity-100"
        />
        <div dangerouslySetInnerHTML={{ __html: highlightedUsage }} />
      </div>

      <h2>Source</h2>
      <p>
        This is the full plugin source. After installation, it lives at{" "}
        <code>{plugin.installPath}/index.ts</code> and you can modify it however you like.
      </p>
      {sourceCode && highlightedSource && (
        <div className="code-block-wrapper relative group not-prose">
          <CopyButton text={sourceCode} className="opacity-0 group-hover:opacity-100" />
          <div dangerouslySetInnerHTML={{ __html: highlightedSource }} />
        </div>
      )}

      <h2>Tags</h2>
      <div className="not-prose flex flex-wrap gap-2">
        {plugin.tags.map((tag) => (
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

export default async function PluginPage({ params }: PageProps) {
  const { slug } = await params;

  // Index page
  if (!slug || slug.length === 0) {
    return (
      <div className="flex gap-12 px-8 py-10 max-w-screen-xl mx-auto w-full">
        <article className="flex-1 min-w-0 max-w-3xl pb-[50vh]">
          <PluginsIndexPage />
        </article>
      </div>
    );
  }

  // Plugin detail page
  const plugin = getPluginByName(slug[0]!);
  if (!plugin) notFound();

  // Highlight the source code
  const sourceCode = getPluginSource(plugin.name);
  const highlighter = await getHighlighter();

  let highlightedSource: string | null = null;
  if (sourceCode) {
    highlightedSource = highlighter.codeToHtml(sourceCode, {
      lang: "typescript",
      themes: shikiThemes,
      defaultColor: false,
    });
  }

  // Highlight the usage example
  const usageCode = `import { processMdx } from "@document0/mdx";
import { ${plugin.name.replace(/-/g, "")} } from "./${plugin.installPath}";

const result = await processMdx(source, {
  plugins: [${plugin.name.replace(/-/g, "")}()],
});`;

  const highlightedUsage = highlighter.codeToHtml(usageCode, {
    lang: "typescript",
    themes: shikiThemes,
    defaultColor: false,
  });

  return (
    <div className="flex gap-12 px-8 py-10 max-w-screen-xl mx-auto w-full">
      <article className="flex-1 min-w-0 max-w-3xl pb-[50vh]">
        <PluginDetailPage
          plugin={plugin}
          highlightedSource={highlightedSource}
          highlightedUsage={highlightedUsage}
        />
      </article>
    </div>
  );
}
