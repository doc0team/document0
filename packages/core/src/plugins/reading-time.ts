import type {
  Document0Plugin,
  PluginMdxResult,
  PluginContext,
} from "../plugin.js";

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

export function readingTime(options?: ReadingTimeOptions): Document0Plugin {
  const wpm = options?.wordsPerMinute ?? 250;

  return {
    name: "reading-time",
    transformResult(
      result: PluginMdxResult,
      context: PluginContext,
    ): PluginMdxResult {
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
