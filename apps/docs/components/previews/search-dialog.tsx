"use client";

import { useState, useRef, useEffect } from "react";

const mockResults = [
  { title: "Introduction", description: "Get started with document0", url: "#" },
  { title: "Installation", description: "Install the core packages", url: "#" },
  { title: "Quick Start", description: "Build your first docs site in 5 minutes", url: "#" },
];

export function SearchDialogPreview() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? mockResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  useEffect(() => {
    setSelected(0);
  }, [query]);

  return (
    <div className="relative h-[300px]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg" />
      <div className="absolute inset-x-0 top-[10%] mx-auto w-full max-w-lg px-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-zinc-800 px-4">
            <svg
              className="h-4 w-4 shrink-0 text-zinc-500"
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
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs..."
              className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none"
            />
            <kbd className="inline-flex items-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
              ESC
            </kbd>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {query && filtered.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
            {filtered.length > 0 && (
              <ul className="py-2">
                {filtered.map((result, i) => (
                  <li key={result.title}>
                    <div
                      onMouseEnter={() => setSelected(i)}
                      className={[
                        "w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors cursor-pointer",
                        selected === i ? "bg-zinc-800" : "hover:bg-zinc-800/60",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "text-sm font-medium",
                          selected === i ? "text-white" : "text-zinc-200",
                        ].join(" ")}
                      >
                        {result.title}
                      </span>
                      <span className="text-xs text-zinc-500 line-clamp-1">
                        {result.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!query && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                Type to search documentation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
