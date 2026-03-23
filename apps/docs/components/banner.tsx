"use client";

import type { ReactNode } from "react";

const VARIANTS = {
  default: ["#52525b", "#a1a1aa", "#52525b"],
  info: ["#52525b", "#a1a1aa", "#52525b"],
  warning: ["#78350f", "#fbbf24", "#78350f"],
  success: ["#064e3b", "#34d399", "#064e3b"],
} as const;

type BannerVariant = keyof typeof VARIANTS;

export function Banner({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: BannerVariant;
}) {
  const [c1, c2, c3] = VARIANTS[variant];
  const conicBg = `conic-gradient(${c1}, ${c2}, ${c3}, ${c1})`;

  return (
    <div className="relative my-6 rounded-xl p-px overflow-hidden">
      <div
        className="absolute inset-[-100%]"
        style={{
          background: conicBg,
          animation: "callout-spin 6s linear infinite",
        }}
      />
      <div className="relative rounded-[11px] bg-zinc-950 px-5 py-4 text-center">
        <div className="text-sm font-medium text-zinc-400 [&>p]:m-0 [&_strong]:text-white">
          {children}
        </div>
      </div>
    </div>
  );
}
