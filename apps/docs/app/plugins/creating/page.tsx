import Link from "next/link";

export const metadata = {
  title: "Creating a Plugin",
  description: "Learn how to create your own document0 plugin.",
};

export default function CreatingPluginPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Creating a Plugin
      </h1>
      <p className="mt-4 text-zinc-400 leading-relaxed">
        Build your own plugin and optionally share it with the community.
      </p>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">1. Create the Plugin</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          A plugin is a function that returns an object with hooks. Here&apos;s a
          minimal example:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
{`// plugins/my-plugin/index.ts

export function myPlugin(options?: { enabled?: boolean }) {
  return {
    name: "my-plugin",

    transformResult(result, context) {
      if (!options?.enabled) return result;

      return {
        ...result,
        myCustomField: "hello from plugin",
      };
    },
  };
}`}
          </pre>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">2. Use the Plugin</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Import and add your plugin to the processing pipeline:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
{`import { processMdx } from "@document0/mdx";
import { myPlugin } from "./plugins/my-plugin";

const result = await processMdx(source, {
  plugins: [myPlugin({ enabled: true })],
});

console.log(result.myCustomField); // "hello from plugin"`}
          </pre>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">3. Example: Remark Plugin</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Plugins can inject remark/rehype plugins into the MDX pipeline:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
{`import { visit } from "unist-util-visit";

function remarkUppercase() {
  return (tree) => {
    visit(tree, "text", (node) => {
      node.value = node.value.toUpperCase();
    });
  };
}

export function uppercasePlugin() {
  return {
    name: "uppercase",
    remarkPlugins: [remarkUppercase],
  };
}`}
          </pre>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">4. Example: Data Transform</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Plugins can transform pages after they&apos;re loaded:
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 font-mono text-sm">
          <pre className="text-zinc-300 overflow-x-auto">
{`export function draftFilter() {
  return {
    name: "draft-filter",

    transformPages(pages) {
      // Filter out draft pages in production
      if (process.env.NODE_ENV === "production") {
        return pages.filter(p => !p.frontmatter.draft);
      }
      return pages;
    },
  };
}`}
          </pre>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-white">5. Share Your Plugin</h2>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Once your plugin is working, you can submit it to the community registry:
        </p>

        <ol className="mt-4 space-y-2 text-zinc-400 list-decimal list-inside">
          <li>Fork the document0 repository</li>
          <li>
            Add your plugin to{" "}
            <code className="text-zinc-300">registry/plugins/your-plugin/</code>
          </li>
          <li>
            Create a <code className="text-zinc-300">registry.json</code> with
            metadata
          </li>
          <li>Open a pull request</li>
        </ol>

        <div className="mt-6">
          <Link
            href="/plugins/submit"
            className="inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
          >
            Submit Your Plugin →
          </Link>
        </div>
      </div>
    </div>
  );
}
