import { ref, type Ref } from "vue";
import type { TreeNode } from "@document0/core";
import type { MdcRoot } from "@/components/MdcRenderer.vue";

interface PageData {
  title: string;
  description?: string;
  body: MdcRoot;
  toc: TocEntry[];
  breadcrumbs: BreadcrumbItem[];
  previous: NavItem | null;
  next: NavItem | null;
}

interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface NavItem {
  name: string;
  url: string;
}

export type { PageData, TocEntry, BreadcrumbItem, NavItem };

let treeCache: TreeNode[] | null = null;

export function usePageTree(): Ref<TreeNode[]> {
  const tree = ref<TreeNode[]>([]);

  async function load() {
    if (treeCache) {
      tree.value = treeCache;
      return;
    }
    try {
      const res = await fetch("/api/tree");
      treeCache = await res.json();
      tree.value = treeCache!;
    } catch {
      tree.value = [];
    }
  }

  load();
  return tree;
}

export async function fetchPage(slug: string): Promise<PageData | null> {
  try {
    const res = await fetch(`/api/page/${slug}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
