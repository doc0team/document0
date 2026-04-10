import fs from "node:fs/promises";
import path from "node:path";
import type {
  PageData,
  TreeNode,
  PageNode,
  FolderNode,
  MetaFile,
} from "../types.js";

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

async function readMetaFromDir(dir: string): Promise<MetaFile | null> {
  const candidates = ["_meta.json"];
  for (const candidate of candidates) {
    const full = path.join(dir, candidate);
    try {
      const raw = await fs.readFile(full, "utf-8");
      return JSON.parse(raw) as MetaFile;
    } catch {
      continue;
    }
  }
  return null;
}

function orderByMeta(nodes: TreeNode[], meta: MetaFile): TreeNode[] {
  if (!meta.pages || meta.pages.length === 0) return nodes;

  const order = meta.pages;
  const ordered: TreeNode[] = [];
  const remaining = [...nodes];

  for (const key of order) {
    if (key === "---") {
      ordered.push({ type: "separator", name: "" });
      continue;
    }
    if (key.startsWith("--- ")) {
      ordered.push({ type: "separator", name: key.slice(4) });
      continue;
    }
    const idx = remaining.findIndex((n) => {
      if (n.type === "page") return n.slug.endsWith(key) || n.url.endsWith(key);
      if (n.type === "folder") return n.name.toLowerCase() === key.toLowerCase();
      return false;
    });
    if (idx !== -1) {
      ordered.push(remaining[idx]!);
      remaining.splice(idx, 1);
    }
  }

  return [...ordered, ...remaining];
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
  const meta = await readMetaFromDir(dir);

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
      const subMeta = await readMetaFromDir(subDir);
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
