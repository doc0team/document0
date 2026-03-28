import path from "node:path";
import fs from "node:fs";
import { DocsSource, buildPageTree } from "@document0/core";
import { createOpenAPISource, buildOpenAPITree } from "@document0/core/openapi";
import type { OpenAPIPageData, TreeNode, SeparatorNode, PageNode } from "@document0/core";

const docsRootDir = path.join(process.cwd(), "content/docs");
const openapiPath = path.join(process.cwd(), "openapi.json");
const registryPath = path.join(process.cwd(), "../../registry/registry-index.json");

export const source = new DocsSource({
  rootDir: docsRootDir,
  baseUrl: "/docs",
});

export interface RegistryPlugin {
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  category: string;
  frameworks: string[];
  files: string[];
  dependencies: Record<string, string>;
  registryDependencies: string[];
  installPath: string;
}

export interface RegistryIndex {
  version: number;
  plugins: RegistryPlugin[];
}

let cachedRegistry: RegistryIndex | null = null;

export function getRegistry(): RegistryIndex {
  if (cachedRegistry) return cachedRegistry;
  const raw = fs.readFileSync(registryPath, "utf-8");
  cachedRegistry = JSON.parse(raw) as RegistryIndex;
  return cachedRegistry;
}

export function getPluginByName(name: string): RegistryPlugin | undefined {
  return getRegistry().plugins.find((p) => p.name === name);
}

export function getPluginSource(name: string): string | null {
  const plugin = getPluginByName(name);
  if (!plugin) return null;
  const filePath = path.join(process.cwd(), "../../registry/plugins", name, "index.ts");
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

export function getPluginsTree(): TreeNode[] {
  const registry = getRegistry();
  const mdxPlugins = registry.plugins.filter((p) => p.category === "mdx");
  const corePlugins = registry.plugins.filter((p) => p.category === "core");

  const nodes: TreeNode[] = [];

  // Index page
  nodes.push({
    type: "page",
    name: "Introduction",
    url: "/plugins",
    slug: "",
  } as PageNode);

  // MDX Plugins section
  if (mdxPlugins.length > 0) {
    nodes.push({ type: "separator", name: "MDX Plugins" } as SeparatorNode);
    for (const plugin of mdxPlugins) {
      nodes.push({
        type: "page",
        name: plugin.name,
        url: `/plugins/${plugin.name}`,
        slug: plugin.name,
      } as PageNode);
    }
  }

  // Core Plugins section
  if (corePlugins.length > 0) {
    nodes.push({ type: "separator", name: "Core Plugins" } as SeparatorNode);
    for (const plugin of corePlugins) {
      nodes.push({
        type: "page",
        name: plugin.name,
        url: `/plugins/${plugin.name}`,
        slug: plugin.name,
      } as PageNode);
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
