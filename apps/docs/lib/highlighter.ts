import { createHighlighter, type HighlighterGeneric, type BundledLanguage, type BundledTheme } from "shiki";
import type { RehypeShikiThemes } from "@document0/mdx";

/**
 * Dual themes matching Fumadocs' approach.
 * Shiki emits `--shiki-light` and `--shiki-dark` CSS vars on each span.
 * CSS reads `--shiki-dark` for our dark site.
 */
export const shikiThemes: RehypeShikiThemes = {
  light: "github-light",
  dark: "github-dark",
};

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null;

export async function getHighlighter() {
  if (highlighter) return highlighter;
  highlighter = await createHighlighter({
    themes: [shikiThemes.light, shikiThemes.dark],
    langs: [
      "typescript", "javascript", "tsx", "jsx",
      "bash", "sh", "json", "css", "html",
      "mdx", "markdown", "yaml", "toml",
    ],
  });
  return highlighter;
}
