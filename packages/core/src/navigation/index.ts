import type {
  TreeNode,
  PageNode,
  BreadcrumbItem,
  PageNeighbours,
} from "../types.js";

function flattenTree(nodes: TreeNode[]): PageNode[] {
  const pages: PageNode[] = [];
  for (const node of nodes) {
    if (node.type === "page") {
      pages.push(node);
    } else if (node.type === "folder") {
      if (node.index) pages.push(node.index);
      pages.push(...flattenTree(node.children));
    }
  }
  return pages;
}

function collectAncestors(
  nodes: TreeNode[],
  targetUrl: string,
  ancestors: BreadcrumbItem[] = []
): BreadcrumbItem[] | null {
  for (const node of nodes) {
    if (node.type === "page") {
      if (node.url === targetUrl) {
        return [...ancestors, { name: node.name, url: node.url }];
      }
    } else if (node.type === "folder") {
      const next: BreadcrumbItem[] = node.index
        ? [...ancestors, { name: node.name, url: node.index.url }]
        : [...ancestors, { name: node.name, url: "" }];

      if (node.index?.url === targetUrl) {
        return [...ancestors, { name: node.name, url: node.index.url }];
      }

      const found = collectAncestors(node.children, targetUrl, next);
      if (found) return found;
    }
  }
  return null;
}

export function getBreadcrumbs(
  tree: TreeNode[],
  currentUrl: string
): BreadcrumbItem[] {
  return collectAncestors(tree, currentUrl) ?? [];
}

export function getPageNeighbours(
  tree: TreeNode[],
  currentUrl: string
): PageNeighbours {
  const flat = flattenTree(tree);
  const idx = flat.findIndex((p) => p.url === currentUrl);

  return {
    previous: idx > 0 ? { name: flat[idx - 1]!.name, url: flat[idx - 1]!.url } : null,
    next: idx >= 0 && idx < flat.length - 1 ? { name: flat[idx + 1]!.name, url: flat[idx + 1]!.url } : null,
  };
}

export function isActive(nodeUrl: string, currentUrl: string): boolean {
  return nodeUrl === currentUrl;
}

export function isActiveOrAncestor(
  node: TreeNode,
  currentUrl: string
): boolean {
  if (node.type === "page") return node.url === currentUrl;
  if (node.type === "folder") {
    if (node.index?.url === currentUrl) return true;
    return node.children.some((child) =>
      isActiveOrAncestor(child, currentUrl)
    );
  }
  return false;
}

export function flattenPages(tree: TreeNode[]): PageNode[] {
  return flattenTree(tree);
}

export function findNode(
  tree: TreeNode[],
  url: string
): TreeNode | undefined {
  for (const node of tree) {
    if (node.type === "page" && node.url === url) return node;
    if (node.type === "folder") {
      if (node.index?.url === url) return node.index;
      const found = findNode(node.children, url);
      if (found) return found;
    }
  }
  return undefined;
}
