"use client";

import { useId } from "react";

export function FumadocsIcon(props: React.SVGProps<SVGSVGElement>) {
  const id = useId();
  return (
    <svg width="80" height="80" viewBox="0 0 180 180" {...props}>
      <circle
        cx="90"
        cy="90"
        r="89"
        fill={`url(#${id}-iconGradient)`}
        stroke="var(--color-primary)"
        strokeWidth="1"
      />
      <defs>
        <linearGradient id={`${id}-iconGradient`} gradientTransform="rotate(45)">
          <stop offset="45%" stopColor="var(--color-background)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
