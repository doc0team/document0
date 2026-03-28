export const metadata = {
  title: "CLI Reference",
  description: "document0 CLI commands for managing plugins.",
};

export default function CliReferencePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        CLI Reference
      </h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">
        The document0 CLI helps you discover and install plugins from the registry.
      </p>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Installation</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          You can run the CLI directly with npx (no installation needed):
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm">
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-zinc-500 select-none">$</span>
            <span>npx @document0/cli --help</span>
          </div>
        </div>

        <p className="mt-4 text-zinc-400 leading-relaxed">
          Or install it globally:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm">
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-zinc-500 select-none">$</span>
            <span>npm install -g @document0/cli</span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Commands</h2>

        <div className="mt-6 space-y-8">
          <div>
            <h3 className="font-mono text-white">document0 list</h3>
            <p className="mt-2 text-sm text-zinc-400">
              List all available plugins in the registry.
            </p>
            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-zinc-500 select-none">$</span>
                <span>npx @document0/cli list</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-white">document0 search &lt;query&gt;</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Search plugins by name, description, or tags.
            </p>
            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-zinc-500 select-none">$</span>
                <span>npx @document0/cli search callout</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-mono text-white">
              document0 add &lt;plugin&gt; [plugin2...]
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Install one or more plugins. Downloads the source code into your
              project and installs any required dependencies.
            </p>
            <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 font-mono text-sm space-y-2">
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-zinc-500 select-none">$</span>
                <span>npx @document0/cli add admonitions</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-300">
                <span className="text-zinc-500 select-none">$</span>
                <span>npx @document0/cli add reading-time content-graph</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">Environment Variables</h2>

        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 className="font-mono text-sm text-white">DOCUMENT0_REGISTRY</h3>
          <p className="mt-1.5 text-sm text-zinc-400">
            Override the default registry URL. Useful for testing local plugins
            or using a private registry.
          </p>
          <div className="mt-3 font-mono text-xs text-zinc-500">
            Default: https://raw.githubusercontent.com/doc0team/document0/main/registry
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">What Happens on Install</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          When you run <code className="text-zinc-300">document0 add</code>:
        </p>

        <ol className="mt-4 space-y-2 text-zinc-400 list-decimal list-inside">
          <li>The CLI fetches the plugin metadata from the registry</li>
          <li>
            Source files are downloaded and copied to{" "}
            <code className="text-zinc-300">plugins/&lt;name&gt;/</code>
          </li>
          <li>Any npm dependencies are automatically installed</li>
          <li>You get the import path to use in your code</li>
        </ol>

        <p className="mt-4 text-zinc-400 leading-relaxed">
          The source is now yours — modify it however you like.
        </p>
      </div>
    </div>
  );
}
