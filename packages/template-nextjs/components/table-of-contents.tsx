"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocEntry } from "@document0/mdx";

export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    function onScroll() {
      let current = "";
      for (const entry of toc) {
        const el = document.getElementById(entry.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 80) current = entry.id;
        }
      }
      setActiveId(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="py-6 pr-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          On this page
        </p>
        <ul className="space-y-1">
          {toc.map((entry) => (
            <li key={entry.id} style={{ paddingLeft: `${(entry.depth - 1) * 0.75}rem` }}>
              <a
                href={`#${entry.id}`}
                className={cn(
                  "block py-1 text-sm transition-colors",
                  activeId === entry.id
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {entry.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
