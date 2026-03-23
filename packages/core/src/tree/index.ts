import fs from "node:fs";
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

function readMetaFromDir(dir: string): MetaFile | null {
  const candidates = ["_meta.json"];
  for (const candidate of candidates) {
    const full = path.join(dir, candidate);
    if (fs.existsSync(full)) {
      try {
        return JSON.parse(fs.readFileSync(full, "utf-8")) as MetaFile;
      } catch {
        return null;
      }
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

export function buildPageTree(pages: PageData[], rootDir: string): TreeNode[] {
  return buildTree(pages, rootDir, rootDir);
}

function buildTree(
  pages: PageData[],
  dir: string,
  rootDir: string
): TreeNode[] {
  const nodes: TreeNode[] = [];
  const meta = readMetaFromDir(dir);

  const pagesInDir = pages.filter((p) => {
    const pageDir = path.dirname(p.filePath);
    return pageDir === dir;
  });

  const subDirs = new Set(
    pages
      .filter((p) => {
        const rel = path.relative(dir, p.filePath);
        const parts = rel.split(path.sep);
        return parts.length > 1;
      })
      .map((p) => {
        const rel = path.relative(dir, p.filePath);
        const parts = rel.split(path.sep);
        return path.join(dir, parts[0]!);
      })
  );

  for (const page of pagesInDir) {
    const isIndex =
      page.slugs.at(-1) === "" ||
      path.basename(page.filePath, path.extname(page.filePath)) === "index";

    if (!isIndex) {
      nodes.push(pageToNode(page));
    }
  }

  for (const subDir of subDirs) {
    const subPages = pages.filter((p) =>
      p.filePath.startsWith(subDir + path.sep)
    );
    const subMeta = readMetaFromDir(subDir);
    const dirName = path.basename(subDir);

    const indexPage = subPages.find(
      (p) =>
        path.basename(p.filePath, path.extname(p.filePath)) === "index" &&
        path.dirname(p.filePath) === subDir
    );

    const children = buildTree(subPages, subDir, rootDir);

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

  return meta ? orderByMeta(nodes, meta) : nodes;
}
