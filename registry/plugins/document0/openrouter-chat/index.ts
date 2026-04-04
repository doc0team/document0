/**
 * OpenRouter Chat — server-side route helper with documentation search tool
 *
 * Creates a POST handler using the Vercel AI SDK that streams chat
 * completions from OpenRouter. Includes a `/search` tool the AI can call
 * to query your documentation pages, mimicking the Fumadocs AI pattern.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/api/chat/route.ts
 * import { createChatRoute } from "@/plugins/document0/openrouter-chat";
 * import { source } from "@/lib/source";
 *
 * export const { POST } = createChatRoute({
 *   pages: source.getPages(),
 *   model: "openai/gpt-4o-mini",
 * });
 * ```
 *
 * Environment variables:
 *   OPENROUTER_API_KEY — your OpenRouter API key (required, server-side only)
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal page shape — compatible with document0 PageData. */
export interface ChatPage {
  slug: string;
  url: string;
  content: string;
  frontmatter?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface OpenRouterChatOptions {
  /**
   * Documentation pages the AI can search. Pass `source.getPages()` from
   * @document0/core, or a function that returns pages for lazy evaluation.
   */
  pages?: ChatPage[] | (() => ChatPage[]);

  /**
   * Maximum number of page results the search tool returns per call.
   * @default 5
   */
  maxResults?: number;

  /**
   * Maximum characters of content included per matched page.
   * @default 4000
   */
  maxPageChars?: number;

  /**
   * OpenRouter model identifier.
   * @default "openai/gpt-4o-mini"
   * @see https://openrouter.ai/models
   */
  model?: string;

  /**
   * System prompt. When pages are provided, a default docs-aware prompt is
   * used. Set to `false` to disable or provide your own string.
   */
  systemPrompt?: string | false;

  /** Maximum tokens for the completion. */
  maxTokens?: number;

  /**
   * Sampling temperature (0–2).
   * @default 0.7
   */
  temperature?: number;

  /**
   * How many tool-call round-trips the model can make per request.
   * @default 3
   */
  maxSteps?: number;

  /** Optional site URL sent in HTTP-Referer (OpenRouter ranking). */
  siteUrl?: string;

  /** Optional site name sent in X-Title (OpenRouter dashboard). */
  siteName?: string;
}

// ---------------------------------------------------------------------------
// Built-in search (lightweight, no external search engine needed)
// ---------------------------------------------------------------------------

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[.*?\]\(.*?\)/g, " ")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, " ")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s*[-*+>]\s+/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1);
}

interface SearchHit {
  title: string;
  url: string;
  excerpt: string;
  score: number;
}

function searchPages(
  pages: ChatPage[],
  query: string,
  limit: number,
  maxChars: number,
): SearchHit[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  const docCount = pages.length;
  const df = new Map<string, number>();

  const pageTexts: string[] = pages.map((page) => {
    const title = page.frontmatter?.title ?? page.slug;
    const desc = page.frontmatter?.description ?? "";
    return stripMarkdown(`${title} ${desc} ${page.content}`);
  });

  for (const text of pageTexts) {
    const unique = new Set(tokenize(text));
    for (const token of unique) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }

  const scored = pages.map((page, i) => {
    const text = pageTexts[i]!;
    const tokens = tokenize(text);
    const freq = new Map<string, number>();
    for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);

    let score = 0;
    for (const qt of queryTokens) {
      const tf = freq.get(qt) ?? 0;
      if (tf === 0) continue;
      const idf = Math.log((docCount + 1) / ((df.get(qt) ?? 0) + 1)) + 1;
      score += tf * idf;

      const title = (page.frontmatter?.title ?? page.slug).toLowerCase();
      if (title.includes(qt)) score += idf * 3;
    }

    const title = page.frontmatter?.title ?? page.slug;
    let excerpt = page.content.trim();
    if (excerpt.length > maxChars) {
      excerpt = excerpt.slice(0, maxChars) + "\n[...truncated]";
    }

    return { title, url: page.url, excerpt, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Default system prompt
// ---------------------------------------------------------------------------

const DEFAULT_SYSTEM_PROMPT = `You are a helpful documentation assistant. You have access to a search tool that can find relevant pages from the documentation. Use it to answer the user's questions accurately.

Guidelines:
- Always search the documentation before answering questions about the docs.
- Reference specific page URLs when citing information.
- If the search returns no relevant results, tell the user honestly.
- Be concise but thorough. Use markdown formatting in your responses.`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a streaming POST route handler for OpenRouter chat with a built-in
 * documentation search tool. Uses the Vercel AI SDK pattern.
 *
 * Returns `{ POST }` for direct re-export in a Next.js route file.
 */
export function createChatRoute(options: OpenRouterChatOptions = {}) {
  const {
    pages: pagesOption,
    maxResults = 5,
    maxPageChars = 4000,
    model: modelId = "openai/gpt-4o-mini",
    systemPrompt,
    maxTokens,
    temperature = 0.7,
    maxSteps = 3,
    siteUrl,
    siteName,
  } = options;

  function getPages(): ChatPage[] {
    if (!pagesOption) return [];
    return typeof pagesOption === "function" ? pagesOption() : pagesOption;
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    headers: {
      ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
      ...(siteName ? { "X-Title": siteName } : {}),
    },
  });

  async function POST(request: Request): Promise<Response> {
    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENROUTER_API_KEY environment variable.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    try {
      const { messages } = (await request.json()) as {
        messages?: UIMessage[];
      };

      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: "messages array is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }

      // Resolve system prompt
      const system =
        systemPrompt === false
          ? undefined
          : systemPrompt ?? (pagesOption ? DEFAULT_SYSTEM_PROMPT : undefined);

      const allPages = getPages();
      const tools =
        allPages.length > 0
          ? {
              search: tool({
                description:
                  "Search the documentation for pages relevant to the query. " +
                  "Returns page titles, URLs, and content excerpts.",
                inputSchema: z.object({
                  query: z
                    .string()
                    .describe("The search query to find relevant documentation pages"),
                }),
                execute: async ({ query }: { query: string }) => {
                  const results = searchPages(
                    allPages,
                    query,
                    maxResults,
                    maxPageChars,
                  );

                  if (results.length === 0) {
                    return { results: [], message: "No relevant pages found." };
                  }

                  return {
                    results: results.map((r) => ({
                      title: r.title,
                      url: r.url,
                      content: r.excerpt,
                    })),
                  };
                },
              }),
            }
          : undefined;

      const modelMessages = await convertToModelMessages(
        messages,
        tools ? { tools } : undefined,
      );

      const result = streamText({
        model: openrouter(modelId),
        system,
        messages: modelMessages,
        tools,
        stopWhen: stepCountIs(maxSteps),
        ...(maxTokens != null ? { maxOutputTokens: maxTokens } : {}),
        temperature,
      });

      return result.toUIMessageStreamResponse();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Internal server error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return { POST };
}
