import "@document0/next-dev/content-stamp";

import path from "node:path";
import { DocsSource, buildPageTree } from "@document0/core";

const rootDir = path.join(process.cwd(), "content/docs");

export const source = new DocsSource({
  rootDir,
  baseUrl: "/docs",
});

export async function getPageTree() {
  return buildPageTree(await source.getPages(), rootDir);
}
