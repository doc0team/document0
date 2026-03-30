"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TreeNode } from "@document0/core";

function isActive(url: string, pathname: string) {
  return pathname === url;
}

function isAncestor(node: TreeNode, pathname: string): boolean {
  if (node.type === "page") return node.url === pathname;
  if (node.type === "folder") {
    if (node.index?.url === pathname) return true;
    return node.children.some((c) => isAncestor(c, pathname));
  }
  return false;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SidebarNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const pathname = usePathname();
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);

  if (node.type === "separator") {
    if (!node.name) {
      return (
        <li className="list-none py-2">
          <div className="h-px bg-zinc-800/80" />
        </li>
      );
    }
    return (
      <li className="list-none">
        <p className={`${depth === 0 ? "mt-6 mb-2" : "mt-4 mb-1"} px-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500`}>
          {node.name}
        </p>
      </li>
    );
  }

  if (node.type === "page") {
    const active = isActive(node.url, pathname);
    return (
      <li className="list-none">
        <Link
          href={node.url}
          className={[
            "group flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-all duration-150",
            depth > 0 ? "ml-3 border-l border-zinc-800/60 pl-3" : "",
            active
              ? "bg-sky-500/10 text-sky-400 font-medium border-sky-500/30"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40",
          ].join(" ")}
        >
          {node.icon && <span className="shrink-0 text-sm">{node.icon}</span>}
          <span>{node.name}</span>
        </Link>
      </li>
    );
  }

  if (node.type === "folder") {
    const hasActiveDescendant = isAncestor(node, pathname);
    const isOpen =
      manualOpen !== null ? manualOpen : hasActiveDescendant || !!node.defaultOpen;
    const indexActive = node.index ? isActive(node.index.url, pathname) : false;

    return (
      <li className="list-none">
        <div className="flex items-center gap-0.5">
          {node.index ? (
            <Link
              href={node.index.url}
              className={[
                "flex-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150",
                depth > 0 ? "ml-3 border-l border-zinc-800/60 pl-3" : "",
                indexActive
                  ? "bg-sky-500/10 text-sky-400"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/40",
              ].join(" ")}
            >
              {node.icon && <span className="shrink-0 text-sm">{node.icon}</span>}
              <span>{node.name}</span>
            </Link>
          ) : (
            <button
              onClick={() => setManualOpen((prev) => (prev !== null ? !prev : !isOpen))}
              className={[
                "flex-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150 text-left",
                depth > 0 ? "ml-3 border-l border-zinc-800/60 pl-3" : "",
                "text-zinc-300 hover:text-white hover:bg-zinc-800/40",
              ].join(" ")}
            >
              {node.icon && <span className="shrink-0 text-sm">{node.icon}</span>}
              <span className="flex-1">{node.name}</span>
              <ChevronIcon open={isOpen} />
            </button>
          )}
          {node.index && node.children.length > 0 && (
            <button
              onClick={() => setManualOpen((prev) => (prev !== null ? !prev : !isOpen))}
              className="shrink-0 rounded-md p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-colors"
              aria-label={isOpen ? "Collapse" : "Expand"}
            >
              <ChevronIcon open={isOpen} />
            </button>
          )}
        </div>
        <div
          className={`grid transition-all duration-200 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {node.children.length > 0 && (
              <ul className="mt-0.5 space-y-0.5 py-0.5">
                {node.children.map((child, i) => (
                  <SidebarNode key={i} node={child} depth={depth + 1} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </li>
    );
  }

  return null;
}

/**
 * Collapsible navigation sidebar with animated expand/collapse.
 *
 * Usage:
 * ```tsx
 * import { Sidebar } from "@/components/document0/sidebar/Sidebar";
 * import { getPageTree } from "@/lib/source";
 *
 * export default function DocsLayout({ children }) {
 *   const tree = getPageTree();
 *   return (
 *     <div className="flex">
 *       <Sidebar tree={tree} />
 *       <main>{children}</main>
 *     </div>
 *   );
 * }
 * ```
 */
export function Sidebar({ tree }: { tree: TreeNode[] }) {
  return (
    <nav className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="overflow-y-auto px-3 py-5 flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
        <ul className="space-y-0.5">
          {tree.map((node, i) => (
            <SidebarNode key={i} node={node} />
          ))}
        </ul>
      </div>
    </nav>
  );
}
