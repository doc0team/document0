"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, isActiveOrAncestor } from "@/lib/utils";
import type { TreeNode } from "@document0/core";

function SidebarNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const pathname = usePathname();

  if (node.type === "separator") {
    if (node.name) {
      return (
        <p className="mt-6 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {node.name}
        </p>
      );
    }
    return <Separator className="my-3" />;
  }

  if (node.type === "page") {
    const active = pathname === node.url;
    return (
      <Link
        href={node.url}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
          depth > 0 && "pl-6",
          active
            ? "bg-accent text-accent-foreground font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
      >
        {node.icon && <span className="shrink-0">{node.icon}</span>}
        {node.name}
      </Link>
    );
  }

  if (node.type === "folder") {
    const open = isActiveOrAncestor(node, pathname) || node.defaultOpen;
    return (
      <div>
        {node.index ? (
          <Link
            href={node.index.url}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              pathname === node.index.url
                ? "bg-accent text-accent-foreground"
                : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
            )}
          >
            {node.icon && <span className="shrink-0">{node.icon}</span>}
            {node.name}
          </Link>
        ) : (
          <p className="px-3 py-1.5 text-sm font-medium text-foreground/80">
            {node.icon && <span className="mr-2">{node.icon}</span>}
            {node.name}
          </p>
        )}
        {open && node.children.length > 0 && (
          <div className="ml-3 border-l border-border pl-2 space-y-0.5">
            {node.children.map((child, i) => (
              <SidebarNode key={i} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function SidebarContent({ tree }: { tree: TreeNode[] }) {
  return (
    <div className="space-y-0.5">
      {tree.map((node, i) => (
        <SidebarNode key={i} node={node} />
      ))}
    </div>
  );
}

export function Sidebar({ tree }: { tree: TreeNode[] }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-border sticky top-14 h-[calc(100vh-3.5rem)]">
      <ScrollArea className="flex-1 px-3 py-4">
        <SidebarContent tree={tree} />
      </ScrollArea>
    </aside>
  );
}
