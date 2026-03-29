"use client";

import { useEffect, useState, useCallback } from "react";

interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

/**
 * Table of contents with scroll-spy highlighting.
 *
 * Usage:
 * ```tsx
 * import { TableOfContents } from "@/components/toc";
 * import { processMdx } from "@document0/mdx";
 *
 * // In your page component:
 * const { toc } = await processMdx(content);
 *
 * return (
 *   <aside>
 *     <TableOfContents toc={toc} />
 *   </aside>
 * );
 * ```
 */
export function TableOfContents({ toc }: { toc: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>("");

  const updateActive = useCallback(() => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
    if (atBottom && toc.length > 0) {
      setActiveId(toc[toc.length - 1].id);
      return;
    }

    const threshold = 80;
    let current = toc.length > 0 ? toc[0].id : "";
    for (const { id } of toc) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= threshold) {
        current = id;
      }
    }
    setActiveId(current);
  }, [toc]);

  useEffect(() => {
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  return (
    <div className="sticky top-20">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        On this page
      </p>
      <ul className="space-y-1">
        {toc.map((entry) => (
          <li key={entry.id} style={{ paddingLeft: `${(entry.depth - 1) * 12}px` }}>
            <a
              href={`#${entry.id}`}
              className={[
                "block py-0.5 text-sm transition-colors",
                activeId === entry.id
                  ? "text-white font-medium"
                  : "text-zinc-500 hover:text-zinc-300",
              ].join(" ")}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
