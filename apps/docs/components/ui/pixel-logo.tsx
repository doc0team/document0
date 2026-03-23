"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export function PixelLogo({
  size = 28,
  className,
  interactive = true,
}: {
  size?: number;
  className?: string;
  interactive?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const leaveTimer = useRef<number>(0);
  const onEnter = useCallback(() => {
    clearTimeout(leaveTimer.current);
    setHovered(true);
  }, []);
  const onLeave = useCallback(() => {
    leaveTimer.current = window.setTimeout(() => setHovered(false), 100);
  }, []);

  const fontSize = size;
  const showExpand = interactive && hovered;

  return (
    <div
      className={cn("flex items-baseline select-none", interactive && "pointer-events-auto cursor-pointer", className)}
      onMouseEnter={interactive ? onEnter : undefined}
      onMouseLeave={interactive ? onLeave : undefined}
    >
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{
          width: showExpand ? `${fontSize * 4.6}px` : "0px",
          opacity: showExpand ? 1 : 0,
        }}
      >
        <span
          className="block whitespace-nowrap text-white"
          style={{
            fontFamily: "var(--font-geist-pixel-square, monospace)",
            fontSize,
            lineHeight: 1,
          }}
        >
          document
        </span>
      </div>
      <span
        className="shrink-0 text-white transition-colors duration-300"
        style={{
          fontFamily: "var(--font-geist-pixel-square, monospace)",
          fontSize,
          lineHeight: 1,
        }}
      >
        0
      </span>
    </div>
  );
}

export default PixelLogo;
