"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  title: string;
  description?: string;
  url: string;
  score: number;
}

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const fetchResults = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/internal/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data: SearchResult[]) => {
        setResults(data);
        setSelected(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 150);
  };

  const navigate = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && results[selected]) {
      navigate(results[selected].url);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-x-0 top-[15%] mx-auto w-full max-w-lg px-4">
        <div
          className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
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
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search docs..."
              className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder:text-zinc-500 outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
              ESC
            </kbd>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {loading && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                Searching...
              </div>
            )}
            {!loading && query && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-zinc-500">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
            {!loading && results.length > 0 && (
              <ul className="py-2">
                {results.map((result, i) => (
                  <li key={result.url}>
                    <button
                      type="button"
                      onClick={() => navigate(result.url)}
                      onMouseEnter={() => setSelected(i)}
                      className={[
                        "w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors",
                        selected === i
                          ? "bg-sky-500/10"
                          : "hover:bg-zinc-800/60",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "text-sm font-medium",
                          selected === i ? "text-sky-400" : "text-zinc-200",
                        ].join(" ")}
                      >
                        {result.title}
                      </span>
                      {result.description && (
                        <span className="text-xs text-zinc-500 line-clamp-1">
                          {result.description}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!loading && !query && (
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
