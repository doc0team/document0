import path from "node:path";
import { DocsSource, buildPageTree } from "@document0/core";
import { createOpenAPISource, buildOpenAPITree } from "@document0/core/openapi";
import type { OpenAPIPageData, TreeNode } from "@document0/core";

const rootDir = path.join(process.cwd(), "content/docs");
const openapiPath = path.join(process.cwd(), "openapi.json");

export const source = new DocsSource({
  rootDir,
  baseUrl: "/docs",
});

let cachedApiPages: OpenAPIPageData[] | null = null;

export async function getApiPages(): Promise<OpenAPIPageData[]> {
  if (cachedApiPages) return cachedApiPages;
  cachedApiPages = await createOpenAPISource(openapiPath, {
    baseUrl: "/api",
  });
  return cachedApiPages;
}

export function getPageTree(): TreeNode[] {
  return buildPageTree(source.getPages(), rootDir);
}

export async function getApiTree(): Promise<TreeNode[]> {
  const apiPages = await getApiPages();
  return buildOpenAPITree(apiPages);
}
