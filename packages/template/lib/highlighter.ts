import { createHighlighter, type HighlighterGeneric, type BundledLanguage, type BundledTheme } from "shiki";

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null;

export async function getHighlighter() {
  if (highlighter) return highlighter;
  highlighter = await createHighlighter({
    themes: ["github-dark", "github-light"],
    langs: [
      "typescript",
      "javascript",
      "tsx",
      "jsx",
      "bash",
      "sh",
      "json",
      "css",
      "html",
      "mdx",
      "markdown",
    ],
  });
  return highlighter;
}
