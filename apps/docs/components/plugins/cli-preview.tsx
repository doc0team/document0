"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";

const commands = [
  { label: "Install", command: "npx @document0/cli add document0/sidebar", description: "Add a plugin or component to your project" },
  { label: "List", command: "npx @document0/cli list", description: "Show all available plugins and components" },
  { label: "Search", command: "npx @document0/cli search stripe/", description: "Browse a namespace" },
];

export function CliPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = commands[activeIndex]!;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex border-b border-zinc-800">
        {commands.map((cmd, i) => (
          <button
            key={cmd.label}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              i === activeIndex
                ? "text-white bg-zinc-900"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {cmd.label}
          </button>
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="text-emerald-500 select-none">$</span>
          <span className="text-zinc-300 flex-1">{active.command}</span>
          <CopyButton text={active.command} />
        </div>
        <p className="mt-3 text-xs text-zinc-500">{active.description}</p>
      </div>
    </div>
  );
}
