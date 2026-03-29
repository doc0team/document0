"use client";

import { useState, useMemo } from "react";
import { PluginCard } from "./plugin-card";

interface Plugin {
  name: string;
  namespace: string;
  description: string;
  category: "mdx" | "core" | "ui";
  tags: string[];
  frameworks: string[];
  author: string;
}

interface PluginSearchProps {
  plugins: Plugin[];
}

export function PluginSearch({ plugins }: PluginSearchProps) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "mdx" | "core" | "ui">("all");

  const filtered = useMemo(() => {
    return plugins.filter((plugin) => {
      const matchesCategory = categoryFilter === "all" || plugin.category === categoryFilter;
      if (!matchesCategory) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase();
      return (
        plugin.name.toLowerCase().includes(q) ||
        plugin.namespace.toLowerCase().includes(q) ||
        plugin.description.toLowerCase().includes(q) ||
        plugin.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [plugins, query, categoryFilter]);

  const mdxCount = plugins.filter((p) => p.category === "mdx").length;
  const coreCount = plugins.filter((p) => p.category === "core").length;
  const uiCount = plugins.filter((p) => p.category === "ui").length;

  return (
    <div>
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plugins..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-colors"
          />
        </div>
        <div className="flex rounded-lg border border-zinc-800 overflow-hidden">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2.5 text-sm transition-colors ${
              categoryFilter === "all"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setCategoryFilter("ui")}
            className={`px-4 py-2.5 text-sm transition-colors border-l border-zinc-800 ${
              categoryFilter === "ui"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            UI ({uiCount})
          </button>
          <button
            onClick={() => setCategoryFilter("mdx")}
            className={`px-4 py-2.5 text-sm transition-colors border-l border-zinc-800 ${
              categoryFilter === "mdx"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            MDX ({mdxCount})
          </button>
          <button
            onClick={() => setCategoryFilter("core")}
            className={`px-4 py-2.5 text-sm transition-colors border-l border-zinc-800 ${
              categoryFilter === "core"
                ? "bg-zinc-800 text-white"
                : "bg-zinc-900/50 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Core ({coreCount})
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="min-h-[400px]">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No plugins found matching &quot;{query}&quot;</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((plugin) => (
              <PluginCard
                key={`${plugin.namespace}/${plugin.name}`}
                name={plugin.name}
                namespace={plugin.namespace}
                description={plugin.description}
                category={plugin.category}
                tags={plugin.tags}
                frameworks={plugin.frameworks}
                author={plugin.author}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
