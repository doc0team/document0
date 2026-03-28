import Link from "next/link";

export const metadata = {
  title: "Plugins",
  description:
    "Extend document0 with community plugins. Add features like callouts, reading time, backlinks, and more.",
};

export default function PluginsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-white">Plugins</h1>
      <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
        Plugins extend document0 with additional features — callouts, reading
        time, backlinks, and more. Install them with the CLI or copy the source
        directly into your project.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link
          href="/plugins/browse"
          className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
        >
          <div className="mb-3 inline-flex rounded-lg bg-sky-500/10 p-2.5 text-sky-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white">Browse Plugins</h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            Explore all available plugins and find the right ones for your project.
          </p>
        </Link>

        <Link
          href="/plugins/creating"
          className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
        >
          <div className="mb-3 inline-flex rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white">Create a Plugin</h2>
          <p className="mt-1.5 text-sm text-zinc-400">
            Learn how to build your own plugin and contribute to the ecosystem.
          </p>
        </Link>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold text-white">How It Works</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          document0 plugins follow the{" "}
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            shadcn/ui
          </a>{" "}
          model: you install the source code into your project, not an npm
          dependency. This gives you full ownership and the ability to customize
          anything.
        </p>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-3 font-mono text-sm text-zinc-300">
            <span className="text-zinc-500 select-none">$</span>
            <span>npx @document0/cli add admonitions</span>
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            This copies the plugin source into <code className="text-zinc-400">plugins/admonitions/</code> in your project.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold text-white">Plugin Types</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-400">
                MDX
              </span>
              <span className="text-sm font-medium text-white">
                MDX Pipeline Plugins
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Extend the MDX compilation pipeline with remark or rehype plugins.
              Transform markdown syntax, add custom components, or process code
              blocks.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                CORE
              </span>
              <span className="text-sm font-medium text-white">
                Core Data Plugins
              </span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              Work with the data layer — transform pages, modify the page tree,
              add computed metadata, or analyze content relationships.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold text-white">Framework Support</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Most plugins are framework-agnostic and work anywhere document0 runs.
          Some MDX plugins that emit JSX components require a JSX-compatible
          framework (React, Vue, Solid, etc.). Each plugin&apos;s listing shows
          its compatibility.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {["React", "Next.js", "Astro", "Vue", "Solid", "Svelte"].map((fw) => (
            <span
              key={fw}
              className="rounded-md bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-400"
            >
              {fw}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">
          Ready to get started?
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Browse the plugin registry or learn how to create your own.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/plugins/browse"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            Browse Plugins
          </Link>
          <Link
            href="/plugins/how-it-works"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
