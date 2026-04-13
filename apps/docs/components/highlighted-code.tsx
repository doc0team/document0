"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export function HighlightedCode({
  code,
  lang = "tsx",
  className,
  theme = "github-light",
}: {
  code: string;
  lang?: string;
  className?: string;
  /** `github-dark` for dark page backgrounds */
  theme?: "github-light" | "github-dark";
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    codeToHtml(code, {
      lang,
      theme,
    }).then(setHtml);
  }, [code, lang, theme]);

  if (!html) {
    return (
      <pre
        className={`text-[13px] leading-relaxed font-mono whitespace-pre ${theme === "github-dark" ? "text-zinc-400" : "text-zinc-700"} ${className ?? ""}`}
      >
        {code}
      </pre>
    );
  }

  return (
    <div
      className={`[&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:text-[13px] [&_pre]:leading-relaxed ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
