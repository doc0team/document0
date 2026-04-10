import "server-only";

import "@document0/next-dev/content-stamp";

import path from "node:path";
import fs from "node:fs";
import { DocsSource, buildPageTree } from "@document0/core";
import { createOpenAPISource, buildOpenAPITree } from "@document0/core/openapi";
import type { OpenAPIPageData, TreeNode, SeparatorNode, PageNode, FolderNode } from "@document0/core";

const docsRootDir = path.join(process.cwd(), "content/docs");
const openapiPath = path.join(process.cwd(), "openapi.json");
const registryPath = path.join(process.cwd(), "../../registry/registry-index.json");

export const source = new DocsSource({
  rootDir: docsRootDir,
  baseUrl: "/docs",
});

export interface RegistryItem {
  name: string;
  namespace: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: "mdx" | "core" | "ui";
  frameworks: string[];
  files: string[];
  dependencies: Record<string, string>;
  registryDependencies: string[];
  installPath: string;
  preview?: boolean;
  logo?: string;
  framework?: "react" | "vue";
}

export interface RegistryIndex {
  version: number;
  items: RegistryItem[];
}

let cachedRegistry: RegistryIndex | null = null;

export function getRegistry(): RegistryIndex {
  if (cachedRegistry) return cachedRegistry;
  const raw = fs.readFileSync(registryPath, "utf-8");
  cachedRegistry = JSON.parse(raw) as RegistryIndex;
  return cachedRegistry;
}

/** Full identifier: "namespace/name" */
export function getItemId(item: RegistryItem): string {
  return `${item.namespace}/${item.name}`;
}

export function getItemByFullId(fullId: string): RegistryItem | undefined {
  const [ns, name] = fullId.split("/");
  return getRegistry().items.find((p) => p.namespace === ns && p.name === name);
}

export function getItemBySlug(namespace: string, name: string): RegistryItem | undefined {
  return getRegistry().items.find((p) => p.namespace === namespace && p.name === name);
}

export function getItemSource(namespace: string, name: string): string | null {
  const item = getItemBySlug(namespace, name);
  if (!item) return null;

  const dir = item.category === "ui" ? "ui" : "plugins";
  const fileName = item.files[0] || "index.ts";
  const filePath = path.join(process.cwd(), "../../registry", dir, namespace, name, fileName);

  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getPluginsTree(): TreeNode[] {
  const registry = getRegistry();
  const nodes: TreeNode[] = [];

  nodes.push({
    type: "page",
    name: "Explore",
    url: "/plugins",
    slug: "",
  } as PageNode);

  const mdxItems = registry.items.filter((i) => i.category === "mdx");
  const coreItems = registry.items.filter((i) => i.category === "core");
  const uiItems = registry.items.filter((i) => i.category === "ui");

  if (mdxItems.length > 0 || coreItems.length > 0) {
    nodes.push({ type: "separator", name: "Plugins" } as SeparatorNode);

    if (mdxItems.length > 0) {
      nodes.push({
        type: "folder",
        name: "MDX",
        defaultOpen: false,
        children: mdxItems.map((item) => ({
          type: "page" as const,
          name: item.name,
          url: `/plugins/${item.namespace}/${item.name}`,
          slug: item.name,
        })),
      } as FolderNode);
    }

    if (coreItems.length > 0) {
      nodes.push({
        type: "folder",
        name: "Core",
        defaultOpen: false,
        children: coreItems.map((item) => ({
          type: "page" as const,
          name: item.name,
          url: `/plugins/${item.namespace}/${item.name}`,
          slug: item.name,
        })),
      } as FolderNode);
    }
  }

  const uiNamespaces = [...new Set(uiItems.map((i) => i.namespace))];

  if (uiItems.length > 0) {
    nodes.push({ type: "separator", name: "UI Components" } as SeparatorNode);

    const frameworkSuffixes = ["-vue", "-react", "-svelte", "-solid"];

    function getBaseNamespace(ns: string): string {
      for (const suffix of frameworkSuffixes) {
        if (ns.endsWith(suffix)) return ns.slice(0, -suffix.length);
      }
      return ns;
    }

    function getFrameworkLabel(ns: string, base: string): string {
      if (ns === base) return "React";
      const suffix = ns.slice(base.length + 1);
      return suffix.charAt(0).toUpperCase() + suffix.slice(1);
    }

    const uiByBase = new Map<string, string[]>();
    for (const ns of uiNamespaces) {
      const base = getBaseNamespace(ns);
      if (!uiByBase.has(base)) uiByBase.set(base, []);
      uiByBase.get(base)!.push(ns);
    }

    for (const [base, variants] of uiByBase) {
      if (variants.length === 1) {
        const ns = variants[0];
        const nsItems = uiItems.filter((i) => i.namespace === ns);
        nodes.push({
          type: "folder",
          name: ns,
          defaultOpen: false,
          children: nsItems.map((item) => ({
            type: "page" as const,
            name: item.name,
            url: `/plugins/${ns}/${item.name}`,
            slug: item.name,
          })),
        } as FolderNode);
      } else {
        const children: TreeNode[] = variants.map((ns) => {
          const nsItems = uiItems.filter((i) => i.namespace === ns);
          const label = getFrameworkLabel(ns, base);
          return {
            type: "folder" as const,
            name: label,
            defaultOpen: ns === base,
            children: nsItems.map((item) => ({
              type: "page" as const,
              name: item.name,
              url: `/plugins/${ns}/${item.name}`,
              slug: item.name,
            })),
          } as FolderNode;
        });

        nodes.push({
          type: "folder",
          name: base,
          defaultOpen: base === "document0",
          children,
        } as FolderNode);
      }
    }
  }

  return nodes;
}

let cachedApiPages: OpenAPIPageData[] | null = null;

export async function getApiPages(): Promise<OpenAPIPageData[]> {
  if (cachedApiPages) return cachedApiPages;
  cachedApiPages = await createOpenAPISource(openapiPath, {
    baseUrl: "/api",
  });
  return cachedApiPages;
}

export async function getPageTree(): Promise<TreeNode[]> {
  return buildPageTree(await source.getPages(), docsRootDir);
}

export async function getApiTree(): Promise<TreeNode[]> {
  const apiPages = await getApiPages();
  return buildOpenAPITree(apiPages);
}
