export const metadata = {
  title: "How Plugins Work",
  description: "Learn how document0 plugins work under the hood.",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        How Plugins Work
      </h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">
        document0 plugins follow a simple contract that hooks into the
        documentation pipeline at multiple points.
      </p>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">The Plugin Interface</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Every plugin is a function that returns an object with optional hooks:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
{`interface Document0Plugin {
  name: string;

  // MDX pipeline hooks
  remarkPlugins?: Plugin[];
  rehypePlugins?: Plugin[];

  // Data layer hooks
  transformPages?: (pages: PageData[]) => PageData[];
  transformTree?: (tree: TreeNode[]) => TreeNode[];

  // Result hooks
  transformResult?: (result, context) => result;
}`}
          </pre>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Hook Lifecycle</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-medium text-white">
              1. remarkPlugins / rehypePlugins
            </h3>
            <p className="mt-1.5 text-sm text-zinc-400">
              Injected into the MDX compilation pipeline. Remark plugins
              transform the markdown AST; rehype plugins transform the HTML AST.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-medium text-white">2. transformPages</h3>
            <p className="mt-1.5 text-sm text-zinc-400">
              Called after pages are loaded from the filesystem. Modify page
              metadata, filter pages, or add computed properties.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-medium text-white">3. transformTree</h3>
            <p className="mt-1.5 text-sm text-zinc-400">
              Called after the page tree is built. Reorder nodes, add virtual
              pages, or inject separators.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
            <h3 className="text-sm font-medium text-white">4. transformResult</h3>
            <p className="mt-1.5 text-sm text-zinc-400">
              Called after MDX compilation. Add computed fields like reading
              time, word count, or custom metadata to the result.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Source Ownership</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Unlike npm packages, document0 plugins are installed as source code
          into your project. This means:
        </p>
        <ul className="mt-4 space-y-2 text-zinc-400">
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span>
            You can modify the code to fit your needs
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span>
            No version conflicts or dependency hell
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span>
            Full visibility into what the plugin does
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span>
            Works offline after installation
          </li>
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Framework Compatibility</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Plugins are categorized by their framework requirements:
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
              CORE
            </span>
            <p className="text-sm text-zinc-400">
              Pure data transformations. Work with any framework or even without one.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-sky-400">
              MDX
            </span>
            <p className="text-sm text-zinc-400">
              Transform markdown or emit JSX. Some MDX plugins work universally;
              others require a JSX-compatible framework.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
