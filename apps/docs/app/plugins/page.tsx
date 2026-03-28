import { Header } from "@/components/header";
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
    install: "document0 add admonitions",
  },
  {
    name: "reading-time",
    description:
      "Adds readingTime (minutes) and wordCount to your processed MDX output.",
    author: "document0",
    version: "0.1.0",
    tags: ["reading-time", "word-count", "metadata"],
    category: "core" as const,
    install: "document0 add reading-time",
  },
  {
    name: "content-graph",
    description:
      "Builds a directed graph of internal links across all pages. Enables backlinks, broken link detection, and related pages.",
    author: "document0",
    version: "0.1.0",
    tags: ["graph", "backlinks", "broken-links", "navigation"],
    category: "core" as const,
    install: "document0 add content-graph",
  },
];

export const metadata = {
  title: "Plugins",
  description: "Browse and install community plugins for document0.",
};

export default function PluginsPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-zinc-950">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-screen-xl px-6 py-16">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Plugins
            </h1>
            <p className="mt-3 text-base text-zinc-400 max-w-2xl">
              Browse community plugins for document0. Install with the CLI or
              copy the source — you own the code.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 font-mono text-sm text-zinc-300">
                <span className="text-zinc-500 select-none">$</span>
                <span>npx @document0/cli list</span>
              </div>
              <a
                href="https://github.com/doc0team/document0/blob/main/CONTRIBUTING-PLUGINS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Submit a plugin
              </a>
            </div>
          </div>

          <PluginGrid plugins={plugins} />
        </div>
      </main>
    </div>
  );
}
