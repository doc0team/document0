import type { PageData, TreeNode } from "./types.js";

export interface PluginMdxResult {
  code: string;
  frontmatter: Record<string, unknown>;
  toc: { id: string; text: string; depth: number }[];
  [key: string]: unknown;
}

export interface PluginContext {
  /** Full source string including frontmatter. */
  source: string;
  /** Content with frontmatter stripped. */
  content: string;
}

export interface Document0Plugin {
  name: string;

  /** Remark plugins to add to the MDX compilation pipeline. */
  remarkPlugins?: unknown[];

  /** Rehype plugins to add to the MDX compilation pipeline. */
  rehypePlugins?: unknown[];

  /** Transform pages after loading from the file system. */
  transformPages?: (pages: PageData[]) => PageData[];

  /** Transform the page tree after it is built. */
  transformTree?: (tree: TreeNode[]) => TreeNode[];

  /** Transform the processed MDX result. Runs after compilation. */
  transformResult?: (
    result: PluginMdxResult,
    context: PluginContext,
  ) => PluginMdxResult;
}

export function resolvePlugins(plugins: Document0Plugin[]): {
  remarkPlugins: unknown[];
  rehypePlugins: unknown[];
} {
  const remarkPlugins: unknown[] = [];
  const rehypePlugins: unknown[] = [];

  for (const plugin of plugins) {
    if (plugin.remarkPlugins) remarkPlugins.push(...plugin.remarkPlugins);
    if (plugin.rehypePlugins) rehypePlugins.push(...plugin.rehypePlugins);
  }

  return { remarkPlugins, rehypePlugins };
}

export function applyPageTransforms(
  pages: PageData[],
  plugins: Document0Plugin[],
): PageData[] {
  let result = pages;
  for (const plugin of plugins) {
    if (plugin.transformPages) result = plugin.transformPages(result);
  }
  return result;
}

export function applyTreeTransforms(
  tree: TreeNode[],
  plugins: Document0Plugin[],
): TreeNode[] {
  let result = tree;
  for (const plugin of plugins) {
    if (plugin.transformTree) result = plugin.transformTree(result);
  }
  return result;
}

export function applyResultTransforms(
  result: PluginMdxResult,
  context: PluginContext,
  plugins: Document0Plugin[],
): PluginMdxResult {
  let current = result;
  for (const plugin of plugins) {
    if (plugin.transformResult) {
      current = plugin.transformResult(current, context);
    }
  }
  return current;
}
