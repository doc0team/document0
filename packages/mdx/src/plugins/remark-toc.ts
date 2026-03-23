import { visit } from "unist-util-visit";

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

export interface RemarkTocOptions {
  onToc?: (toc: TocEntry[]) => void;
}

function headingToId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

type TextNode = { type: string; value?: string; children?: TextNode[] };

function extractText(node: TextNode): string {
  if (node.type === "text" || node.type === "inlineCode") {
    return node.value ?? "";
  }
  if (node.children) {
    return node.children.map(extractText).join("");
  }
  return "";
}

export function remarkToc(options: RemarkTocOptions = {}) {
  return (tree: Parameters<typeof visit>[0]) => {
    const toc: TocEntry[] = [];

    visit(tree, "heading", (node: Record<string, unknown>) => {
      const text = extractText(node as TextNode);
      const id = headingToId(text);
      toc.push({ id, text, depth: node["depth"] as number });
    });

    options.onToc?.(toc);
  };
}
