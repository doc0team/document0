import path from "node:path";
import { DocsSource, buildPageTree } from "@document0/core";

const rootDir = path.join(process.cwd(), "content/docs");

export const source = new DocsSource({
  rootDir,
  baseUrl: "/docs",
});

export function getPageTree() {
  return buildPageTree(source.getPages(), rootDir);
}
