import type { ReactNode } from "react";

const VARIANTS = {
  info: {
    bg: "bg-sky-950/40",
    border: "border-sky-900/50",
    icon: (
      <svg className="h-4 w-4 text-sky-400" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25a.75.75 0 0 0-1.5 0v1a.75.75 0 0 0 1.5 0v-1ZM8 8a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 8Z" clipRule="evenodd" />
      </svg>
    ),
  },
  warning: {
    bg: "bg-amber-950/40",
    border: "border-amber-900/50",
    icon: (
      <svg className="h-4 w-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l5.082 9.524c.633 1.187-.168 2.629-1.543 2.629H2.918c-1.375 0-2.176-1.442-1.543-2.63L6.457 1.048ZM8 5a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 5Zm0 6.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  danger: {
    bg: "bg-red-950/40",
    border: "border-red-900/50",
    icon: (
      <svg className="h-4 w-4 text-red-400" viewBox="0 0 16 16" fill="currentColor">
        <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 0L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
      </svg>
    ),
  },
  tip: {
    bg: "bg-emerald-950/40",
    border: "border-emerald-900/50",
    icon: (
      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1.5c-1.336 0-2.569.48-3.518 1.274-.147.123-.321.24-.516.314A2.397 2.397 0 0 0 2.5 5.327V6.5a.75.75 0 0 0 1.5 0V5.327a.897.897 0 0 1 .574-.837c.372-.14.694-.358.957-.578A4.483 4.483 0 0 1 8 3a4.483 4.483 0 0 1 2.469.912c.263.22.585.437.957.578.37.145.574.48.574.837V9.5c0 .357-.204.692-.574.837-.372.14-.694.358-.957.578A4.483 4.483 0 0 1 8 12.839a4.483 4.483 0 0 1-2.469-.912c-.263-.22-.585-.437-.957-.578A.897.897 0 0 1 4 10.512V9.5a.75.75 0 0 0-1.5 0v1.012c0 .857.515 1.617 1.266 1.938.195.084.369.191.516.314A5.961 5.961 0 0 0 8 14.5a5.961 5.961 0 0 0 3.718-1.736c.147-.123.321-.23.516-.314A2.397 2.397 0 0 0 13.5 10.212V5.327a2.397 2.397 0 0 0-1.266-1.938c-.195-.084-.369-.191-.516-.314A5.961 5.961 0 0 0 8 1.5Z" />
      </svg>
    ),
  },
} as const;

type CalloutVariant = keyof typeof VARIANTS;

export function Callout({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: CalloutVariant;
}) {
  const v = VARIANTS[type];
  return (
    <div className={`my-5 flex gap-3 rounded-xl border ${v.border} ${v.bg} px-4 py-3.5`}>
      <div className="mt-0.5 shrink-0">{v.icon}</div>
      <div className="min-w-0 text-sm leading-relaxed text-zinc-300 [&>p]:m-0 [&>p+p]:mt-2 [&_strong]:text-white">
        {children}
      </div>
    </div>
  );
}
