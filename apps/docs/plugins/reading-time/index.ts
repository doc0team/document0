export interface ReadingTimeOptions {
  /** Words per minute. @default 250 */
  wordsPerMinute?: number;
}

function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s*[-*+>]\s+/gm, "")
    .replace(/\n{2,}/g, " ")
    .trim();
}

interface ProcessedMdx {
  code: string;
  frontmatter: Record<string, unknown>;
  toc: { id: string; text: string; depth: number }[];
  [key: string]: unknown;
}

/**
 * Document0 plugin: adds `readingTime` (minutes) and `wordCount`
 * to the processed MDX result.
 *
 * ```ts
 * processMdx(source, { plugins: [readingTime()] });
 * // result.readingTime → 3
 * // result.wordCount   → 742
 * ```
 */
export function readingTime(options?: ReadingTimeOptions) {
  const wpm = options?.wordsPerMinute ?? 250;

  return {
    name: "reading-time",
    transformResult(
      result: ProcessedMdx,
      context: { source: string; content: string },
    ): ProcessedMdx {
      const text = stripMarkdown(context.content);
      const words = text.split(/\s+/).filter(Boolean).length;
      return {
        ...result,
        readingTime: Math.max(1, Math.ceil(words / wpm)),
        wordCount: words,
      };
    },
  };
}
