import Link from "next/link";

export const metadata = {
  title: "Submit a Plugin",
  description: "Learn how to submit your plugin to the document0 registry.",
};

export default function SubmitPluginPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Submit a Plugin
      </h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">
        Share your plugin with the document0 community by submitting it to the
        registry.
      </p>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Requirements</h2>
        <ul className="mt-4 space-y-2 text-zinc-400">
          <li className="flex gap-2">
            <span className="text-sky-400">•</span>
            Plugin must be self-contained (no imports from @document0/* internals)
          </li>
          <li className="flex gap-2">
            <span className="text-sky-400">•</span>
            Include a clear description of what the plugin does
          </li>
          <li className="flex gap-2">
            <span className="text-sky-400">•</span>
            Document any options or configuration
          </li>
          <li className="flex gap-2">
            <span className="text-sky-400">•</span>
            Specify framework compatibility accurately
          </li>
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Registry Structure</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Your plugin lives in{" "}
          <code className="text-zinc-300">registry/plugins/your-plugin/</code>:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300">
{`registry/plugins/my-plugin/
├── registry.json    # Plugin metadata
└── index.ts         # Plugin source code`}
          </pre>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">registry.json</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          The metadata file describes your plugin:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
{`{
  "name": "my-plugin",
  "description": "Short description of what it does.",
  "author": "your-github-username",
  "version": "0.1.0",
  "tags": ["relevant", "search", "tags"],
  "category": "mdx",
  "frameworks": ["react", "next", "astro"],
  "files": ["index.ts"],
  "dependencies": {
    "some-npm-package": "^1.0.0"
  },
  "installPath": "plugins/my-plugin"
}`}
          </pre>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-4 text-left font-medium text-zinc-300">
                  Field
                </th>
                <th className="py-2 text-left font-medium text-zinc-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="text-zinc-400">
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4 font-mono text-zinc-300">name</td>
                <td className="py-2">Unique plugin name (kebab-case)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4 font-mono text-zinc-300">category</td>
                <td className="py-2">&quot;mdx&quot; or &quot;core&quot;</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4 font-mono text-zinc-300">frameworks</td>
                <td className="py-2">
                  Array: &quot;any&quot;, &quot;react&quot;, &quot;next&quot;, &quot;astro&quot;, &quot;vue&quot;, &quot;solid&quot;, &quot;svelte&quot;
                </td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4 font-mono text-zinc-300">dependencies</td>
                <td className="py-2">npm packages to auto-install</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Submission Process</h2>

        <ol className="mt-4 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
              1
            </span>
            <div>
              <p className="text-zinc-300">Fork the repository</p>
              <p className="mt-1 text-sm text-zinc-500">
                Fork{" "}
                <a
                  href="https://github.com/doc0team/document0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  doc0team/document0
                </a>{" "}
                on GitHub
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
              2
            </span>
            <div>
              <p className="text-zinc-300">Add your plugin</p>
              <p className="mt-1 text-sm text-zinc-500">
                Create{" "}
                <code className="text-zinc-400">
                  registry/plugins/your-plugin/
                </code>{" "}
                with registry.json and source files
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
              3
            </span>
            <div>
              <p className="text-zinc-300">Update the index</p>
              <p className="mt-1 text-sm text-zinc-500">
                Add your plugin entry to{" "}
                <code className="text-zinc-400">registry/registry-index.json</code>
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300">
              4
            </span>
            <div>
              <p className="text-zinc-300">Open a pull request</p>
              <p className="mt-1 text-sm text-zinc-500">
                Title: <code className="text-zinc-400">plugin: your-plugin</code>
              </p>
            </div>
          </li>
        </ol>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Test Locally</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Before submitting, test your plugin with a local registry:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm space-y-2">
          <div className="text-zinc-500"># Set registry to your local clone</div>
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-zinc-500 select-none">$</span>
            <span>export DOCUMENT0_REGISTRY=file://$(pwd)/registry</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-zinc-500 select-none">$</span>
            <span>npx @document0/cli add your-plugin</span>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Ready to submit?</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Read the full contribution guide and open a pull request.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="https://github.com/doc0team/document0/blob/main/CONTRIBUTING-PLUGINS.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
          >
            Contribution Guide
          </a>
          <a
            href="https://github.com/doc0team/document0/fork"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
          >
            Fork Repository
          </a>
        </div>
      </div>
    </div>
  );
}
