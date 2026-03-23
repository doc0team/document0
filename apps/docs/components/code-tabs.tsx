"use client";

import { useState, type ReactNode, type ReactElement, Children, isValidElement } from "react";

interface CodeTabsProps {
  children: ReactNode;
  labels: string[];
}

export function CodeTabs({ children, labels }: CodeTabsProps) {
  const [active, setActive] = useState(0);

  const panels = Children.toArray(children).filter(
    (child): child is ReactElement => isValidElement(child)
  );

  return (
    <div className="my-5 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="flex border-b border-zinc-800 bg-zinc-900/60">
        {labels.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setActive(i)}
            className={[
              "px-4 py-2 text-xs font-medium transition-colors relative",
              active === i
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300",
            ].join(" ")}
          >
            {label}
            {active === i && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-sky-400" />
            )}
          </button>
        ))}
      </div>
      <div className="[&_.code-block-wrapper]:my-0 [&_pre]:rounded-none [&_pre]:border-0 [&_pre]:my-0">
        {panels[active]}
      </div>
    </div>
  );
}
