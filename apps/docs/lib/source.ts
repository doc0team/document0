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

  const namespaces = [...new Set(registry.items.map((i) => i.namespace))];
  const nodes: TreeNode[] = [];

  nodes.push({
    type: "page",
    name: "Explore",
    url: "/plugins",
    slug: "",
  } as PageNode);

  for (const ns of namespaces) {
    const nsItems = registry.items.filter((i) => i.namespace === ns);
    const mdx = nsItems.filter((i) => i.category === "mdx");
    const core = nsItems.filter((i) => i.category === "core");
    const ui = nsItems.filter((i) => i.category === "ui");

    nodes.push({ type: "separator", name: ns } as SeparatorNode);

    if (mdx.length > 0) {
      const children = mdx.map((item) => ({
        type: "page" as const,
        name: item.name,
        url: `/plugins/${ns}/${item.name}`,
        slug: item.name,
      })) as PageNode[];

      nodes.push({
        type: "folder",
        name: "MDX Plugins",
        defaultOpen: true,
        children,
      } as FolderNode);
    }

    if (core.length > 0) {
      const children = core.map((item) => ({
        type: "page" as const,
        name: item.name,
        url: `/plugins/${ns}/${item.name}`,
        slug: item.name,
      })) as PageNode[];

      nodes.push({
        type: "folder",
        name: "Core Plugins",
        defaultOpen: true,
        children,
      } as FolderNode);
    }

    if (ui.length > 0) {
      const children = ui.map((item) => ({
        type: "page" as const,
        name: item.name,
        url: `/plugins/${ns}/${item.name}`,
        slug: item.name,
      })) as PageNode[];

      nodes.push({
        type: "folder",
        name: "UI Components",
        defaultOpen: true,
        children,
      } as FolderNode);
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

export function getPageTree(): TreeNode[] {
  return buildPageTree(source.getPages(), docsRootDir);
}

export async function getApiTree(): Promise<TreeNode[]> {
  const apiPages = await getApiPages();
  return buildOpenAPITree(apiPages);
}
