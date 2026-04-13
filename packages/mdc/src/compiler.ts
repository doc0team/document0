import type { Root, Element, Text, Node } from "hast";
import { visit } from "unist-util-visit";
import type { MdcNode, MdcRoot, TocEntry } from "./types.js";

function hastToMdc(node: Node): MdcNode | null {
  if (node.type === "text") {
    const textNode = node as Text;
    if (!textNode.value.trim()) return null;
    return { type: "text", value: textNode.value };
  }

  if (node.type === "element") {
    const el = node as Element;
    const children = (el.children ?? [])
      .map(hastToMdc)
      .filter((n): n is MdcNode => n !== null);

    const mdcNode: MdcNode = {
      type: "element",
      tag: el.tagName,
    };

    const props = el.properties;
    if (props && Object.keys(props).length > 0) {
      mdcNode.props = props as Record<string, unknown>;
    }

    if (children.length > 0) {
      mdcNode.children = children;
    }

    return mdcNode;
  }

  if (node.type === "root") {
    const root = node as Root;
    const children = root.children
      .map(hastToMdc)
      .filter((n): n is MdcNode => n !== null);
    return { type: "element", tag: "root", children };
  }

  return null;
}

export function compileHastToMdc(hast: Root): MdcRoot {
  const children = hast.children
    .map(hastToMdc)
    .filter((n): n is MdcNode => n !== null);

  return { type: "root", children };
}

export function extractToc(hast: Root): TocEntry[] {
  const toc: TocEntry[] = [];

  visit(hast, "element", (node: Element) => {
    const match = node.tagName.match(/^h([1-6])$/);
    if (!match) return;

    const depth = parseInt(match[1], 10);
    const id = (node.properties?.id as string) ?? "";
    const text = getTextContent(node);

    if (text) {
      toc.push({ id, text, depth });
    }
  });

  return toc;
}

function getTextContent(node: Node): string {
  if (node.type === "text") return (node as Text).value;
  if ("children" in node) {
    return ((node as Element).children ?? []).map(getTextContent).join("");
  }
  return "";
}
