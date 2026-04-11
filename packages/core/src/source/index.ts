import fs from "node:fs/promises";
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

async function readMeta(dir: string): Promise<MetaFile | null> {
  const full = path.join(dir, "_meta.json");
  try {
    const raw = await fs.readFile(full, "utf-8");
    return JSON.parse(raw) as MetaFile;
  } catch {
    return null;
  }
}

async function scanDir(
  dir: string,
  rootDir: string,
  baseUrl: string,
  extensions: string[]
): Promise<PageData[]> {
  const pages: PageData[] = [];
  let entries: import("node:fs").Dirent[];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return pages;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      pages.push(...await scanDir(fullPath, rootDir, baseUrl, extensions));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name);
    if (!extensions.includes(ext)) continue;

    if (entry.name.startsWith("_")) continue;

    try {
      const raw = await fs.readFile(fullPath, "utf-8");
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
  private _slugMap: Map<string, PageData> | null = null;
  private _urlMap: Map<string, PageData> | null = null;
  private _cache = new Map<string, unknown>();

  constructor(options: SourceOptions) {
    this.rootDir = path.resolve(options.rootDir);
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.extensions = options.extensions ?? DEFAULT_EXTENSIONS;
    this.plugins = options.plugins ?? [];
  }

  async getPages(): Promise<PageData[]> {
    if (this._pages) return this._pages;
    let pages = await scanDir(
      this.rootDir,
      this.rootDir,
      this.baseUrl,
      this.extensions,
    );
    pages = applyPageTransforms(pages, this.plugins);
    this._pages = pages;

    this._slugMap = new Map();
    this._urlMap = new Map();
    for (const page of pages) {
      this._slugMap.set(page.slug, page);
      this._urlMap.set(page.url, page);
    }

    return this._pages;
  }

  async getPageTree(): Promise<TreeNode[]> {
    if (this._tree) return this._tree;
    let tree = await buildPageTree(await this.getPages(), this.rootDir);
    tree = applyTreeTransforms(tree, this.plugins);
    this._tree = tree;
    return this._tree;
  }

  async getPage(slug: string): Promise<PageData | undefined> {
    await this.getPages();
    return this._slugMap!.get(slug);
  }

  async getPageByUrl(url: string): Promise<PageData | undefined> {
    await this.getPages();
    return this._urlMap!.get(url);
  }

  async getMeta(dir: string): Promise<MetaFile | null> {
    return readMeta(path.join(this.rootDir, dir));
  }

  /** Absolute path to the scanned content directory. Used by `watchDocsSource` (`@document0/core/watch`). */
  getContentRoot(): string {
    return this.rootDir;
  }

  /** Extensions treated as pages. Used by `watchDocsSource` (`@document0/core/watch`). */
  getContentExtensions(): readonly string[] {
    return this.extensions;
  }

  /**
   * Retrieve a cached value by key, or create and store it using the factory.
   * Cleared on `invalidate()`.
   */
  async getOrSet<T>(key: string, factory: () => T | Promise<T>): Promise<T> {
    if (this._cache.has(key)) return this._cache.get(key) as T;
    const value = await factory();
    this._cache.set(key, value);
    return value;
  }

  invalidate(): void {
    this._pages = null;
    this._tree = null;
    this._slugMap = null;
    this._urlMap = null;
    this._cache.clear();
  }
}
