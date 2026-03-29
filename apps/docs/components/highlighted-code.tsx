"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";

export function HighlightedCode({
  code,
  lang = "tsx",
  className,
}: {
  code: string;
  lang?: string;
  className?: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    codeToHtml(code, {
      lang,
      theme: "github-light",
    }).then(setHtml);
  }, [code, lang]);

  if (!html) {
    return (
      <pre className={`text-[13px] leading-relaxed font-mono text-zinc-700 whitespace-pre ${className ?? ""}`}>
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
