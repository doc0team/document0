import type { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki";
import type { RehypeShikiCoreOptions } from "@shikijs/rehype/core";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

export interface RehypeShikiThemes {
  light: BundledTheme;
  dark: BundledTheme;
  [key: string]: BundledTheme;
}

export interface RehypeShikiOptions {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;
  defaultLanguage?: string;
  themes?: RehypeShikiThemes;
}

const defaultThemes: RehypeShikiThemes = {
  light: "github-light",
  dark: "github-dark",
};

export function rehypeShiki(options: RehypeShikiOptions) {
  const { highlighter, defaultLanguage = "plaintext", themes = defaultThemes } = options;
  const h = highlighter as unknown as Parameters<typeof rehypeShikiFromHighlighter>[0];

  return rehypeShikiFromHighlighter(h, {
    defaultLanguage,
    themes: themes as Record<string, BundledTheme>,
    defaultColor: false,
  } as RehypeShikiCoreOptions);
}

export function rehypeStripShikiStyle() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "pre") {
        delete node.properties.style;
      }
      if (node.tagName === "code" && node.children.length > 0) {
        const first = node.children[0];
        if (first.type === "text") {
          first.value = first.value.replace(/^\n+/, "");
          if (!first.value) node.children.shift();
        }
        const last = node.children[node.children.length - 1];
        if (last?.type === "text") {
          last.value = last.value.replace(/\n+$/, "");
          if (!last.value) node.children.pop();
        }
      }
    });
  };
}
