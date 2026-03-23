"use client";

import { useState, useCallback, useRef, type ComponentPropsWithoutRef } from "react";

export function CopyButton({ className, ...props }: ComponentPropsWithoutRef<"button">) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => {
    const pre = ref.current?.closest(".code-block-wrapper")?.querySelector("pre");
    const code = pre?.querySelector("code");
    if (!code) return;

    void navigator.clipboard.writeText(code.textContent ?? "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      aria-label="Copy code"
      onClick={handleClick}
      className={[
        "absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
        copied
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {copied ? (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}
