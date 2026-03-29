import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  PageData,
  PageFrontmatter,
  MetaFile,
  SourceOptions,
  TreeNode,
} from "../types.js";
import type { Document0Plugin } from "../plugin.js";
import { applyPageTransforms, applyTreeTransforms } from "../plugin.js";
import { buildPageTree } from "../tree/index.js";

const DEFAULT_EXTENSIONS = [".md", ".mdx"];
const DEFAULT_BASE_URL = "/docs";

function slugify(filePath: string, rootDir: string): string[] {
  const relative = path.relative(rootDir, filePath);
  const withoutExt = relative.replace(/\.[^/.]+$/, "");
  const normalized = withoutExt.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts.map((p: string) => (p === "index" ? "" : p)).filter((p: string, i: number) => {
    if (p === "" && i !== parts.length - 1) return false;
    return true;
  });
}

function buildUrl(slugs: string[], baseUrl: string): string {
  const filtered = slugs.filter(Boolean);
  if (filtered.length === 0) return baseUrl;
  return `${baseUrl}/${filtered.join("/")}`;
}

function readMeta(dir: string): MetaFile | null {
  const candidates = ["_meta.json", "_meta.ts", "_meta.js"];
  for (const candidate of candidates) {
    const full = path.join(dir, candidate);
    if (fs.existsSync(full)) {
      try {
        const raw = fs.readFileSync(full, "utf-8");
        return JSON.parse(raw) as MetaFile;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function scanDir(
  dir: string,
  rootDir: string,
  baseUrl: string,
  extensions: string[]
): PageData[] {
  const pages: PageData[] = [];
  let entries: fs.Dirent[];

  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return pages;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      pages.push(...scanDir(fullPath, rootDir, baseUrl, extensions));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name);
    if (!extensions.includes(ext)) continue;

    if (entry.name.startsWith("_")) continue;

    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = data as PageFrontmatter;

      const slugs = slugify(fullPath, rootDir);
      const slug = slugs.filter(Boolean).join("/");
      const url = buildUrl(slugs, baseUrl);

      pages.push({
        slug,
        slugs,
        url,
        filePath: fullPath,
        frontmatter,
        content,
      });
    } catch {
      continue;
    }
  }

  return pages;
}

export class DocsSource {
  private rootDir: string;
  private baseUrl: string;
  private extensions: string[];
  private plugins: Document0Plugin[];
  private _pages: PageData[] | null = null;
  private _tree: TreeNode[] | null = null;
  /** @internal Generic cache for modules (e.g. search DB). */
  _cache = new Map<string, unknown>();

  constructor(options: SourceOptions) {
    this.rootDir = path.resolve(options.rootDir);
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.extensions = options.extensions ?? DEFAULT_EXTENSIONS;
    this.plugins = options.plugins ?? [];
  }

  getPages(): PageData[] {
    if (this._pages) return this._pages;
    let pages = scanDir(
      this.rootDir,
      this.rootDir,
      this.baseUrl,
      this.extensions,
    );
    pages = applyPageTransforms(pages, this.plugins);
    this._pages = pages;
    return this._pages;
  }

  getPageTree(): TreeNode[] {
    if (this._tree) return this._tree;
    let tree = buildPageTree(this.getPages(), this.rootDir);
    tree = applyTreeTransforms(tree, this.plugins);
    this._tree = tree;
    return this._tree;
  }

  getPage(slug: string): PageData | undefined {
    return this.getPages().find((p) => p.slug === slug);
  }

  getPageByUrl(url: string): PageData | undefined {
    return this.getPages().find((p) => p.url === url);
  }

  getMeta(dir: string): MetaFile | null {
    return readMeta(path.join(this.rootDir, dir));
  }

  invalidate(): void {
    this._pages = null;
    this._tree = null;
    this._cache.clear();
  }
}
