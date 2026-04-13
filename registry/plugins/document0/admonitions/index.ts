import { visit } from "unist-util-visit";

type AdmonitionType = "note" | "tip" | "important" | "warning" | "caution";

const PATTERN = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

interface MdastNode {
  type: string;
  children?: MdastNode[];
  value?: string;
  [key: string]: unknown;
}

export interface AdmonitionsOptions {
  /**
   * JSX component name emitted in the MDX output.
   * You must provide this component in your MDX component map.
   * @default "Callout"
   */
  component?: string;
}

/**
 * Remark plugin: converts GitHub-style blockquote admonitions
 * into MDX JSX elements.
 *
 * ```md
 * > [!NOTE]
 * > Plain text only in the blockquote body. The plugin emits the Callout wrapper.
 * ```
 */
export function remarkAdmonitions(options?: AdmonitionsOptions) {
  const componentName = options?.component ?? "Callout";

  return (tree: Parameters<typeof visit>[0]) => {
    visit(
      tree,
      "blockquote",
      (node: MdastNode, index, parent: MdastNode | undefined) => {
        if (parent === undefined || index === undefined) return;

        const firstChild = node.children?.[0];
        if (!firstChild || firstChild.type !== "paragraph") return;

        const firstInline = firstChild.children?.[0];
        if (!firstInline || firstInline.type !== "text" || !firstInline.value)
          return;

        const match = firstInline.value.match(PATTERN);
        if (!match) return;

        const type = match[1]!.toLowerCase() as AdmonitionType;

        firstInline.value = firstInline.value.slice(match[0].length);
        if (!firstInline.value) firstChild.children!.shift();
        if (firstChild.children!.length === 0) node.children!.shift();

        parent.children![index as number] = {
          type: "mdxJsxFlowElement",
          name: componentName,
          attributes: [
            { type: "mdxJsxAttribute", name: "type", value: type },
          ],
          children: node.children ?? [],
          data: { _mdxExplicitJsx: true },
        };
      },
    );
  };
}

/**
 * Document0 plugin wrapper.
 *
 * ```ts
 * processMdx(source, { plugins: [admonitions()] });
 * ```
 */
export function admonitions(options?: AdmonitionsOptions) {
  return {
    name: "admonitions",
    remarkPlugins: [() => remarkAdmonitions(options)],
  };
}
