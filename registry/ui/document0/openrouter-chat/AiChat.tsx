"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  isTextUIPart,
  type UIMessage,
} from "ai";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type MarkdownPart =
  | { type: "text"; value: string }
  | { type: "code"; lang: string; value: string };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AiChatProps {
  /**
   * POST endpoint created by `createChatRoute()`.
   * @default "/api/chat"
   */
  endpoint?: string;

  /** Title shown in the chat header. @default "AI Assistant" */
  title?: string;

  /** Input placeholder text. @default "Ask a question…" */
  placeholder?: string;

  /** Position of the floating button. @default "bottom-right" */
  position?: "bottom-right" | "bottom-left";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Concatenate text parts from a UI message (AI SDK v6+). */
function textFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("");
}

/**
 * Split ```fenced``` blocks from prose. Fences are highlighted with Shiki;
 * other segments use {@link renderMarkdownNoFences}.
 */
function splitMarkdownFencedBlocks(text: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  const re = /```([\w-+.#]*)\s*\r?\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", value: text.slice(last, m.index) });
    }
    parts.push({ type: "code", lang: m[1] ?? "", value: m[2].trimEnd() });
    last = re.lastIndex;
  }
  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }
  return parts.filter(
    (p) => p.type === "code" || (p.type === "text" && p.value.length > 0),
  );
}

/** Escape + inline only (code spans, bold, links). Used inside headings and paragraphs. */
function mdInline(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /`([^`]+)`/g,
      '<code class="rounded bg-zinc-800 px-1.5 py-0.5 text-[13px] font-mono text-zinc-200">$1</code>',
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-zinc-100">$1</strong>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="break-words text-sky-400 underline underline-offset-2 decoration-sky-400/40 hover:decoration-sky-400 transition-colors">$1</a>',
    );
}

/**
 * Prose between fenced code blocks: ATX headings, paragraphs, soft line breaks.
 * (Previously we only turned newlines into &lt;br />, so ### and lists looked raw.)
 */
function renderMarkdownNoFences(text: string): string {
  const lines = text.split(/\r?\n/);
  const blocks: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length === 0) return;
    const body = para.join(" ");
    blocks.push(
      `<p class="my-2 text-[13px] leading-relaxed [text-wrap:pretty] text-zinc-300">${mdInline(body)}</p>`,
    );
    para = [];
  };

  for (const line of lines) {
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      const level = heading[1]!.length;
      const content = heading[2]!.trimEnd();
      if (level === 1) {
        blocks.push(
          `<h2 class="mt-4 mb-2 text-base font-semibold text-white">${mdInline(content)}</h2>`,
        );
      } else if (level === 2) {
        blocks.push(
          `<h2 class="mt-4 mb-2 text-[15px] font-semibold text-white">${mdInline(content)}</h2>`,
        );
      } else if (level === 3) {
        blocks.push(
          `<h3 class="mt-3 mb-1.5 text-[14px] font-semibold text-zinc-100">${mdInline(content)}</h3>`,
        );
      } else {
        blocks.push(
          `<h4 class="mt-3 mb-1 text-[13px] font-semibold text-zinc-200">${mdInline(content)}</h4>`,
        );
      }
      continue;
    }

    if (line.trim() === "") {
      flushPara();
      continue;
    }

    para.push(line.trim());
  }
  flushPara();
  return blocks.join("");
}

function normalizeShikiLang(raw: string): string {
  const s = raw.trim().toLowerCase();
  const map: Record<string, string> = {
    "": "markdown",
    ts: "typescript",
    js: "javascript",
    jsx: "jsx",
    tsx: "tsx",
    sh: "bash",
    shell: "bash",
    shellscript: "bash",
    zsh: "bash",
    yml: "yaml",
    py: "python",
    golang: "markdown",
    text: "markdown",
    txt: "markdown",
    plaintext: "markdown",
  };
  return map[s] ?? (s || "markdown");
}

/* Shiki github-dark pre uses ~#24292e — keep one surface, no “header bar”. */
const shikiCodeOuterClass =
  "min-w-0 overflow-x-auto [&_.shiki]:min-w-0 [&_.shiki]:overflow-x-auto [&_.shiki]:rounded-lg [&_pre]:m-0 [&_pre]:max-w-full [&_pre]:rounded-lg [&_pre]:border-0 [&_pre]:p-3 [&_pre]:pt-3 [&_pre]:text-[13px] [&_pre]:leading-relaxed";

const shikiPlainPreClass =
  "min-w-0 max-w-full overflow-x-auto rounded-lg border-0 bg-[#24292e] p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap break-words";

const SHEET_WIDTH_NARROW = 448;
const SHEET_WIDTH_WIDE = 672;
const SHEET_WIDTH_MIN = 320;
const SHEET_WIDTH_STORAGE = "d0-ai-chat-sheet-width";

function clampSheetWidth(px: number): number {
  if (typeof window === "undefined") return px;
  const cap = Math.floor(window.innerWidth * 0.95);
  return Math.min(Math.max(px, SHEET_WIDTH_MIN), Math.max(SHEET_WIDTH_MIN, cap));
}

function CopyTextButton({
  text,
  label,
  className = "",
  iconOnly = false,
}: {
  text: string;
  label: string;
  className?: string;
  /** Compact control for code blocks (icon only, no “Copy” label). */
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className={[
        "inline-flex shrink-0 items-center gap-1 font-medium text-zinc-400 transition-colors",
        iconOnly
          ? "rounded-md p-1.5 text-zinc-200 bg-zinc-900/70 backdrop-blur-[2px] hover:bg-zinc-800/90 hover:text-white"
          : "rounded px-1.5 py-0.5 text-[11px] hover:bg-zinc-800 hover:text-zinc-200",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/50",
        className,
      ].join(" ")}
      aria-label={label}
    >
      {copied ? (
        iconOnly ? (
          <span className="text-[10px] font-medium text-emerald-400">OK</span>
        ) : (
          <span className="text-emerald-400">Copied</span>
        )
      ) : (
        <>
          <CopyIcon className="h-3.5 w-3.5" />
          {!iconOnly ? (
            <span className="hidden sm:inline">Copy</span>
          ) : null}
        </>
      )}
    </button>
  );
}

/** Fenced code: copy floats top-right; shown softly on hover / focus-within only. */
function CodeBlockWithCopy({
  code,
  children,
}: {
  code: string;
  children: ReactNode;
}) {
  const revealOnBlock =
    "opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none group-hover:opacity-100 group-focus-within:opacity-100";
  return (
    <div className="group relative my-2 min-w-0 overflow-hidden rounded-lg border border-zinc-800">
      <div
        className={`pointer-events-none absolute right-0 top-0 z-[1] h-[3.5rem] w-[6.5rem] bg-[radial-gradient(ellipse_100%_120%_at_100%_0%,rgb(36_41_46)_0%,rgb(36_41_46)/0.5_45%,transparent_72%)] ${revealOnBlock}`}
        aria-hidden
      />
      <div
        className={`absolute right-2 top-2 z-[2] pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto ${revealOnBlock}`}
      >
        <CopyTextButton
          text={code}
          label="Copy code"
          iconOnly
          className="shadow-md ring-1 ring-black/30"
        />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ChatShikiBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);
  const [plain, setPlain] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { codeToHtml } = await import("shiki/bundle/web");
        const primary = normalizeShikiLang(lang);
        let out: string;
        try {
          out = await codeToHtml(code, {
            lang: primary as never,
            theme: "github-dark",
          });
        } catch {
          out = await codeToHtml(code, {
            lang: "markdown",
            theme: "github-dark",
          });
        }
        if (!cancelled) {
          setHtml(out);
          setPlain(false);
        }
      } catch {
        if (!cancelled) {
          setPlain(true);
          setHtml(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  if (plain) {
    return (
      <CodeBlockWithCopy code={code}>
        <pre className={`${shikiPlainPreClass} text-zinc-300`}>{code}</pre>
      </CodeBlockWithCopy>
    );
  }

  if (html === null) {
    return (
      <CodeBlockWithCopy code={code}>
        <pre className={`${shikiPlainPreClass} text-zinc-400`}>{code}</pre>
      </CodeBlockWithCopy>
    );
  }

  return (
    <CodeBlockWithCopy code={code}>
      <div
        className={shikiCodeOuterClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </CodeBlockWithCopy>
  );
}

function AssistantMarkdown({ text }: { text: string }) {
  const parts = useMemo(() => splitMarkdownFencedBlocks(text), [text]);

  return (
    <div className="min-w-0 max-w-full [text-wrap:pretty] [&_a]:break-words">
      {parts.map((part, i) =>
        part.type === "code" ? (
          <ChatShikiBlock key={i} lang={part.lang} code={part.value} />
        ) : (
          <div
            key={i}
            className="[&_a]:break-words"
            dangerouslySetInnerHTML={{
              __html: renderMarkdownNoFences(part.value),
            }}
          />
        ),
      )}
    </div>
  );
}

function positionPill(position: AiChatProps["position"]) {
  return position === "bottom-left" ? "left-6" : "right-6";
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

/** Lucide `sparkles` paths */
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

/** Wide / narrow panel toggle (horizontal expand metaphor) */
function PanelWidthIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 15 6 6" />
      <path d="m15 9 6-6" />
      <path d="M21 16.5V21h-4.5" />
      <path d="M21 7.5V3h-4.5" />
      <path d="M3 16.5V21h4.5" />
      <path d="m9 15-6 6" />
      <path d="m9 9-6-6" />
      <path d="M3 7.5V3h4.5" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * AI chat: slide-in sheet from the edge + pill trigger (“AI Chat” + sparkles).
 * OpenRouter via the Vercel AI SDK. Tailwind matches document0 docs (zinc / sky).
 *
 * Pair with `createChatRoute()` from `plugins/document0/openrouter-chat`.
 *
 * ```tsx
 * import { AiChat } from "@/components/document0/openrouter-chat/AiChat";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <AiChat endpoint="/api/chat" title="Docs AI" />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function AiChat({
  endpoint = "/api/chat",
  title = "AI Assistant",
  placeholder = "Ask a question…",
  position = "bottom-right",
}: AiChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sheetWidth, setSheetWidth] = useState(SHEET_WIDTH_NARROW);
  const [isResizing, setIsResizing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeDragRef = useRef({ startX: 0, startW: SHEET_WIDTH_NARROW });
  const resizingActiveRef = useRef(false);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: endpoint }),
    [endpoint],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const pillSide = positionPill(position);
  const sheetFromRight = position === "bottom-right";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHEET_WIDTH_STORAGE);
      if (raw) {
        const w = Number.parseInt(raw, 10);
        if (!Number.isNaN(w)) setSheetWidth(clampSheetWidth(w));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onWinResize = () => {
      setSheetWidth((w) => clampSheetWidth(w));
    };
    window.addEventListener("resize", onWinResize);
    return () => window.removeEventListener("resize", onWinResize);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onMove = (e: PointerEvent) => {
      if (!resizingActiveRef.current) return;
      const d = e.clientX - resizeDragRef.current.startX;
      const next = sheetFromRight
        ? resizeDragRef.current.startW - d
        : resizeDragRef.current.startW + d;
      setSheetWidth(clampSheetWidth(next));
    };
    const endResize = () => {
      if (!resizingActiveRef.current) return;
      resizingActiveRef.current = false;
      setIsResizing(false);
      setSheetWidth((w) => {
        const c = clampSheetWidth(w);
        try {
          localStorage.setItem(SHEET_WIDTH_STORAGE, String(c));
        } catch {
          /* ignore */
        }
        return c;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", endResize);
    window.addEventListener("pointercancel", endResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", endResize);
      window.removeEventListener("pointercancel", endResize);
    };
  }, [open, sheetFromRight]);

  const toggleWidePreset = useCallback(() => {
    setSheetWidth((w) => {
      const mid = (SHEET_WIDTH_NARROW + SHEET_WIDTH_WIDE) / 2;
      const next = w >= mid ? SHEET_WIDTH_NARROW : SHEET_WIDTH_WIDE;
      const c = clampSheetWidth(next);
      try {
        localStorage.setItem(SHEET_WIDTH_STORAGE, String(c));
      } catch {
        /* ignore */
      }
      return c;
    });
  }, []);

  const onResizeHandleDown = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      if (!open) return;
      e.preventDefault();
      resizingActiveRef.current = true;
      setIsResizing(true);
      resizeDragRef.current = { startX: e.clientX, startW: sheetWidth };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [open, sheetWidth],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;
      void sendMessage({ text });
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const bubbleUser =
    "min-w-0 max-w-[85%] self-end rounded-2xl rounded-br-md border border-sky-500/25 bg-sky-500/10 px-3.5 py-2.5 text-[13px] leading-relaxed [text-wrap:pretty] text-sky-100";
  const bubbleAssistant =
    "min-w-0 max-w-[85%] self-start rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-[13px] leading-relaxed [text-wrap:pretty] text-zinc-300 [&_pre]:text-zinc-300";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close chat overlay"
          className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="d0-ai-chat-sheet"
        style={{
          width: sheetWidth,
          maxWidth: "100vw",
        }}
        className={[
          "fixed inset-y-0 z-[100] flex flex-col border-zinc-800 bg-zinc-900 shadow-2xl",
          isResizing ? "" : "transition-[transform,width] duration-300 ease-out",
          sheetFromRight ? "right-0 border-l" : "left-0 border-r",
          open
            ? "translate-x-0"
            : sheetFromRight
              ? "translate-x-full"
              : "-translate-x-full",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-hidden={!open}
        aria-label={title}
        inert={!open}
      >
        <button
          type="button"
          aria-label="Drag to resize chat panel"
          title="Drag to resize"
          onPointerDown={onResizeHandleDown}
          className={[
            "absolute top-0 z-20 w-3 touch-none cursor-ew-resize border-0 bg-transparent p-0 hover:bg-sky-500/15 active:bg-sky-500/25",
            sheetFromRight ? "bottom-0 left-0 -translate-x-1/2" : "bottom-0 right-0 translate-x-1/2",
          ].join(" ")}
        />

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <SparklesIcon className="h-4 w-4 shrink-0 text-sky-400" />
            <span className="truncate text-sm font-medium text-zinc-100">
              {title}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={toggleWidePreset}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              title="Toggle wide / narrow width"
              aria-label="Toggle wide or narrow chat width"
            >
              <PanelWidthIcon className="h-4 w-4" />
            </button>
            <kbd className="hidden items-center rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 sm:inline-flex">
              {typeof navigator !== "undefined" &&
              /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)
                ? "⌘"
                : "Ctrl"}
              +.
            </kbd>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              aria-label="Close chat"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
        >
          {messages.length === 0 && (
            <div className="flex max-w-full flex-1 flex-col items-center justify-center gap-2 px-2 py-10 text-center text-sm [text-wrap:pretty] text-zinc-500">
              <SparklesIcon className="h-8 w-8 text-zinc-600" />
              <span>Ask anything about the docs.</span>
            </div>
          )}
          {messages
            .filter(
              (m: UIMessage) => m.role === "user" || m.role === "assistant",
            )
            .map((msg: UIMessage) => {
              const text = textFromUIMessage(msg);
              return (
                <div
                  key={msg.id}
                  className={
                    msg.role === "user" ? bubbleUser : bubbleAssistant
                  }
                >
                  {msg.role === "assistant" ? (
                    text ? (
                      <>
                        <AssistantMarkdown text={text} />
                        <div className="mt-2 flex justify-end border-t border-zinc-700/40 pt-2">
                          <CopyTextButton
                            text={text}
                            label="Copy assistant reply"
                          />
                        </div>
                      </>
                    ) : (
                      <SpinnerIcon className="h-4 w-4 animate-spin text-zinc-500" />
                    )
                  ) : (
                    <span className="min-w-0 whitespace-pre-wrap break-words [text-wrap:pretty]">
                      {text}
                    </span>
                  )}
                </div>
              );
            })}
          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role === "user" && (
              <div className={bubbleAssistant}>
                <SpinnerIcon className="h-4 w-4 animate-spin text-zinc-500" />
              </div>
            )}
          {error && (
            <div
              className={`${bubbleAssistant} border-red-500/30 text-red-400`}
            >
              {error.message || "Something went wrong. Please try again."}
            </div>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex shrink-0 gap-2 border-t border-zinc-800 p-3"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            className="min-h-[2.75rem] min-w-0 flex-1 resize-none rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2.5 text-[13px] [text-wrap:pretty] text-zinc-100 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-sky-500/30"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-lg",
              "border border-zinc-700 bg-zinc-800 text-zinc-100 transition-colors",
              "hover:border-zinc-600 hover:bg-zinc-700",
              "disabled:pointer-events-none disabled:opacity-40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40",
            ].join(" ")}
            aria-label="Send message"
          >
            {isLoading ? (
              <SpinnerIcon className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <SendIcon className="h-4 w-4 text-sky-400" />
            )}
          </button>
        </form>
      </aside>

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={[
            "fixed bottom-6 z-[110] inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/95 px-4 py-2.5 text-sm font-medium text-zinc-100 shadow-lg backdrop-blur-sm",
            "transition-colors hover:border-zinc-600 hover:bg-zinc-800",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
            pillSide,
          ].join(" ")}
          aria-controls="d0-ai-chat-sheet"
          aria-label="Open AI chat"
        >
          <SparklesIcon className="h-4 w-4 shrink-0 text-sky-400" />
          <span>AI Chat</span>
        </button>
      )}
    </>
  );
}
