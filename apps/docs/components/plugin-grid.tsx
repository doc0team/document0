"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

type Framework = "any" | "react" | "next" | "astro" | "vue" | "solid" | "svelte";

interface PluginInfo {
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: "mdx" | "core";
  frameworks: readonly Framework[];
  install: string;
}

function CategoryBadge({ category }: { category: "mdx" | "core" }) {
  const colors =
    category === "mdx"
      ? "border-sky-500/30 text-sky-400 bg-sky-500/10"
      : "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${colors}`}
    >
      {category}
    </span>
  );
}

function FrameworkBadges({ frameworks }: { frameworks: readonly Framework[] }) {
  if (frameworks.includes("any")) {
    return (
      <span className="text-[11px] text-zinc-500">
        Works with any framework
      </span>
    );
  }

  const labels: Record<Framework, string> = {
    any: "Any",
    react: "React",
    next: "Next.js",
    astro: "Astro",
    vue: "Vue",
    solid: "Solid",
    svelte: "Svelte",
  };

  return (
    <div className="flex flex-wrap gap-1">
      {frameworks.map((fw) => (
        <span
          key={fw}
          className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-500"
        >
          {labels[fw]}
        </span>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 rounded p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
      aria-label="Copy install command"
    >
      {copied ? (
        <svg
          className="h-3.5 w-3.5 text-emerald-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function PluginCard({ plugin }: { plugin: PluginInfo }) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-white">{plugin.name}</h3>
          <CategoryBadge category={plugin.category} />
        </div>
        <span className="shrink-0 text-[11px] text-zinc-600">
          v{plugin.version}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-zinc-400 flex-1">
        {plugin.description}
      </p>

      <div className="mt-3">
        <FrameworkBadges frameworks={plugin.frameworks} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {plugin.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[11px] text-zinc-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-1.5 font-mono text-xs text-zinc-400">
        <span className="text-zinc-600 select-none">$</span>
        <span className="flex-1 truncate">{plugin.install}</span>
        <CopyButton text={plugin.install} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-zinc-600">by {plugin.author}</span>
      </div>
    </div>
  );
}

export function PluginGrid({ plugins }: { plugins: PluginInfo[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as "all" | "mdx" | "core" | null;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "mdx" | "core">(
    initialCategory && ["mdx", "core"].includes(initialCategory)
      ? initialCategory
      : "all"
  );
  const [framework, setFramework] = useState<"all" | Framework>("all");

  const filtered = plugins.filter((p) => {
    if (category !== "all" && p.category !== category) return false;
    if (framework !== "all") {
      if (!p.frameworks.includes("any") && !p.frameworks.includes(framework)) {
        return false;
      }
    }
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500"
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
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plugins..."
            className="h-9 w-56 rounded-lg border border-zinc-800 bg-zinc-900/60 pl-9 pr-3 text-sm text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
          {(["all", "mdx", "core"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                category === c
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {c === "all" ? "All" : c.toUpperCase()}
            </button>
          ))}
        </div>

        <select
          value={framework}
          onChange={(e) => setFramework(e.target.value as typeof framework)}
          className="h-9 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 text-sm text-zinc-400 focus:border-zinc-700 focus:outline-none appearance-none cursor-pointer"
        >
          <option value="all">All Frameworks</option>
          <option value="react">React</option>
          <option value="next">Next.js</option>
          <option value="astro">Astro</option>
          <option value="vue">Vue</option>
          <option value="solid">Solid</option>
          <option value="svelte">Svelte</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-600">
          No plugins match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((plugin) => (
            <PluginCard key={plugin.name} plugin={plugin} />
          ))}
        </div>
      )}
    </div>
  );
}
