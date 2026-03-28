import { PluginGrid } from "@/components/plugin-grid";

const plugins = [
  {
    name: "admonitions",
    description:
      "GitHub-style blockquote callouts. Converts > [!NOTE], > [!WARNING] etc. into <Callout> JSX elements.",
    author: "document0",
    version: "0.1.0",
    tags: ["remark", "mdx", "callouts", "markdown"],
    category: "mdx" as const,
    frameworks: ["react", "next", "astro", "vue", "solid", "svelte"] as const,
    install: "npx @document0/cli add admonitions",
  },
  {
    name: "reading-time",
    description:
      "Adds readingTime (minutes) and wordCount to your processed MDX result.",
    author: "document0",
    version: "0.1.0",
    tags: ["reading-time", "word-count", "metadata"],
    category: "core" as const,
    frameworks: ["any"] as const,
    install: "npx @document0/cli add reading-time",
  },
  {
    name: "content-graph",
    description:
      "Builds a directed graph of internal links. Enables backlinks, broken link detection, and related pages.",
    author: "document0",
    version: "0.1.0",
    tags: ["graph", "backlinks", "broken-links", "navigation"],
    category: "core" as const,
    frameworks: ["any"] as const,
    install: "npx @document0/cli add content-graph",
  },
];

export const metadata = {
  title: "Browse Plugins",
  description: "Browse and install community plugins for document0.",
};

export default function BrowsePluginsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Browse Plugins
        </h1>
        <p className="mt-2 text-base text-zinc-400">
          Find and install plugins to extend your documentation.
        </p>
      </div>

      <PluginGrid plugins={plugins} />
    </div>
  );
}
