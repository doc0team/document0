import { visit } from "unist-util-visit";

type AdmonitionType = "note" | "tip" | "important" | "warning" | "caution";

const PATTERN = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i;

interface MdastNode {
  type: string;
  children?: MdastNode[];
  value?: string;
  [key: string]: unknown;
}

export interface RemarkAdmonitionsOptions {
  /**
   * JSX component name emitted in the MDX output.
   * Users must provide this component in their MDX component map.
   * @default "Callout"
   */
  component?: string;
}

/**
 * Remark plugin that converts GitHub-style blockquote admonitions
 * into MDX JSX elements.
 *
 * ```md
 * > [!NOTE]
 * > This becomes a <Callout type="note"> element.
 * ```
 */
export function remarkAdmonitions(options?: RemarkAdmonitionsOptions) {
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
        if (!firstInline.value) {
          firstChild.children!.shift();
        }
        if (firstChild.children!.length === 0) {
          node.children!.shift();
        }

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
 * Convenience wrapper that returns a Document0-compatible plugin object.
 *
 * ```ts
 * processMdx(source, { plugins: [admonitions()] });
 * ```
 */
export function admonitions(options?: RemarkAdmonitionsOptions) {
  return {
    name: "admonitions",
    remarkPlugins: [() => remarkAdmonitions(options)],
  };
}
