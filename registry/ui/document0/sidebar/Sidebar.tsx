"use client";

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

function SidebarNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const pathname = usePathname();

  if (node.type === "separator") {
    return (
      <li className="list-none">
        {node.name ? (
          <p className="mt-5 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {node.name}
          </p>
        ) : (
          <hr className="my-3 border-zinc-800" />
        )}
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
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
            depth > 0 ? "pl-5" : "",
            active
              ? "bg-zinc-800 text-white font-medium"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
          ].join(" ")}
        >
          {node.name}
        </Link>
      </li>
    );
  }

  if (node.type === "folder") {
    const open = isAncestor(node, pathname) || node.defaultOpen;
    return (
      <li className="list-none">
        {node.index ? (
          <Link
            href={node.index.url}
            className={[
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive(node.index.url, pathname)
                ? "bg-zinc-800 text-white"
                : "text-zinc-300 hover:text-white hover:bg-zinc-800/60",
            ].join(" ")}
          >
            {node.name}
          </Link>
        ) : (
          <p className="px-3 py-1.5 text-sm font-medium text-zinc-300">
            {node.name}
          </p>
        )}
        {open && node.children.length > 0 && (
          <ul className="mt-0.5 ml-2 border-l border-zinc-800 pl-2 space-y-0.5">
            {node.children.map((child, i) => (
              <SidebarNode key={i} node={child} depth={depth + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return null;
}

/**
 * Collapsible navigation sidebar.
 *
 * Usage:
 * ```tsx
 * import { Sidebar } from "@/components/sidebar";
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
    <nav className="hidden md:flex w-60 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950 sticky top-14 h-[calc(100vh-3.5rem)]">
      <div className="overflow-y-auto px-3 py-6 flex-1">
        <ul className="space-y-0.5">
          {tree.map((node, i) => (
            <SidebarNode key={i} node={node} />
          ))}
        </ul>
      </div>
    </nav>
  );
}
