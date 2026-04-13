import path from "node:path";
import type {
  PageData,
  TreeNode,
  PageNode,
  FolderNode,
  MetaFile,
} from "../types.js";
import { readMeta } from "../meta.js";

function pageToNode(page: PageData): PageNode {
  return {
    type: "page",
    name: page.frontmatter.title ?? titleFromSlug(page.slugs.at(-1) ?? ""),
    url: page.url,
    slug: page.slug,
    icon: page.frontmatter.icon,
  };
}

function titleFromSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function orderByMeta(nodes: TreeNode[], meta: MetaFile): TreeNode[] {
  if (!meta.pages || meta.pages.length === 0) return nodes;

  const order = meta.pages;

  // Build a map from possible match keys to node, for O(1) lookups.
  const byKey = new Map<string, TreeNode>();
  for (const node of nodes) {
    if (node.type === "page") {
      const slugTail = node.slug.split("/").pop() ?? node.slug;
      const urlTail = node.url.split("/").pop() ?? node.url;
      byKey.set(slugTail, node);
      if (urlTail !== slugTail) byKey.set(urlTail, node);
    } else if (node.type === "folder") {
      byKey.set(node.name.toLowerCase(), node);
    }
  }

  const ordered: TreeNode[] = [];
  const used = new Set<TreeNode>();

  for (const key of order) {
    if (key === "---") {
      ordered.push({ type: "separator", name: "" });
      continue;
    }
    if (key.startsWith("--- ")) {
      ordered.push({ type: "separator", name: key.slice(4) });
      continue;
    }
    const node = byKey.get(key) ?? byKey.get(key.toLowerCase());
    if (node && !used.has(node)) {
      ordered.push(node);
      used.add(node);
    }
  }

  for (const node of nodes) {
    if (!used.has(node)) ordered.push(node);
  }

  return ordered;
}

export async function buildPageTree(pages: PageData[], rootDir: string): Promise<TreeNode[]> {
  // Pre-compute O(1) lookup maps so buildTree never filters the full page list.
  const pagesByDir = new Map<string, PageData[]>();
  const childDirs = new Map<string, Set<string>>();

  for (const page of pages) {
    const dir = path.dirname(page.filePath);

    // Group pages by their immediate directory.
    let bucket = pagesByDir.get(dir);
    if (!bucket) {
      bucket = [];
      pagesByDir.set(dir, bucket);
    }
    bucket.push(page);

    // Register every ancestor→child directory edge up to rootDir.
    let current = dir;
    while (current !== rootDir && current.startsWith(rootDir)) {
      const parent = path.dirname(current);
      let siblings = childDirs.get(parent);
      if (!siblings) {
        siblings = new Set();
        childDirs.set(parent, siblings);
      }
      if (siblings.has(current)) break; // already registered upward
      siblings.add(current);
      current = parent;
    }
  }

  return buildTree(rootDir, pagesByDir, childDirs);
}

async function buildTree(
  dir: string,
  pagesByDir: Map<string, PageData[]>,
  childDirs: Map<string, Set<string>>
): Promise<TreeNode[]> {
  const nodes: TreeNode[] = [];
  const meta = await readMeta(dir);

  const pagesInDir = pagesByDir.get(dir) ?? [];

  for (const page of pagesInDir) {
    const isIndex =
      page.slugs.at(-1) === "" ||
      path.basename(page.filePath, path.extname(page.filePath)) === "index";

    if (!isIndex) {
      nodes.push(pageToNode(page));
    }
  }

  const subDirs = childDirs.get(dir);
  if (subDirs) {
    for (const subDir of subDirs) {
      const subMeta = await readMeta(subDir);
      const dirName = path.basename(subDir);

      const dirPages = pagesByDir.get(subDir) ?? [];
      const indexPage = dirPages.find(
        (p) =>
          path.basename(p.filePath, path.extname(p.filePath)) === "index"
      );

      const children = await buildTree(subDir, pagesByDir, childDirs);

      const folder: FolderNode = {
        type: "folder",
        name: subMeta?.title ?? titleFromSlug(dirName),
        icon: subMeta?.icon,
        defaultOpen: subMeta?.defaultOpen,
        index: indexPage ? pageToNode(indexPage) : undefined,
        children,
      };

      nodes.push(folder);
    }
  }

  return meta ? orderByMeta(nodes, meta) : nodes;
}
