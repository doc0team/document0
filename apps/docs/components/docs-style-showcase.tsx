"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const styles = [
  { id: "minimal", label: "Minimal" },
  { id: "sidebar", label: "Sidebar" },
  { id: "dashboard", label: "Dashboard" },
] as const;

type StyleId = (typeof styles)[number]["id"];

const CYCLE_MS = 4000;

function Bar({ w, className = "" }: { w: string; className?: string }) {
  return (
    <div
      className={`h-2 rounded-full bg-current ${className}`}
      style={{ width: w }}
    />
  );
}

function CodeBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-md border p-2.5 space-y-1.5 ${className}`}>
      <Bar w="70%" className="opacity-40" />
      <Bar w="55%" className="opacity-30" />
      <Bar w="85%" className="opacity-40" />
      <Bar w="40%" className="opacity-30" />
    </div>
  );
}

/* ── 1. Minimal: light, centered, no sidebar ── */
function MinimalSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden text-zinc-300">
      {/* Thin top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded bg-zinc-900" />
          <Bar w="48px" className="!bg-zinc-400" />
        </div>
        <div className="flex items-center gap-4">
          <Bar w="28px" className="!bg-zinc-200" />
          <Bar w="28px" className="!bg-zinc-200" />
          <div className="h-5 w-14 rounded-full border border-zinc-200" />
        </div>
      </div>
      {/* Centered single column */}
      <div className="flex-1 flex justify-center px-8 py-6 overflow-hidden">
        <div className="w-full max-w-[260px] space-y-4">
          <Bar w="35%" className="!h-1.5 !bg-zinc-200" />
          <Bar w="75%" className="!h-4 !bg-zinc-800 !rounded" />
          <Bar w="50%" className="!h-2.5 !bg-zinc-400" />
          <div className="space-y-2 pt-2">
            <Bar w="100%" className="!bg-zinc-200" />
            <Bar w="92%" className="!bg-zinc-200" />
            <Bar w="78%" className="!bg-zinc-200" />
          </div>
          <CodeBlock className="border-zinc-100 text-zinc-200" />
          <div className="space-y-2">
            <Bar w="95%" className="!bg-zinc-200" />
            <Bar w="82%" className="!bg-zinc-200" />
            <Bar w="60%" className="!bg-zinc-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 2. Sidebar: dark, left nav tree, content + right TOC ── */
function SidebarSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#111] rounded-xl overflow-hidden text-zinc-700">
      {/* Header with search */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-white" />
          <Bar w="44px" className="!bg-zinc-400" />
        </div>
        <div className="h-5 w-24 rounded border border-zinc-800 bg-zinc-900" />
      </div>
      {/* Three columns: sidebar | content | toc */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="w-[80px] shrink-0 border-r border-zinc-800 px-3 py-4 space-y-3">
          <Bar w="55%" className="!bg-zinc-500 !h-1.5" />
          <div className="space-y-2 pl-1">
            <Bar w="80%" className="!bg-zinc-700" />
            <Bar w="70%" className="!bg-sky-500 !opacity-80" />
            <Bar w="65%" className="!bg-zinc-700" />
          </div>
          <Bar w="50%" className="!bg-zinc-500 !h-1.5" />
          <div className="space-y-2 pl-1">
            <Bar w="75%" className="!bg-zinc-700" />
            <Bar w="60%" className="!bg-zinc-700" />
            <Bar w="70%" className="!bg-zinc-700" />
            <Bar w="55%" className="!bg-zinc-700" />
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 px-5 py-4 space-y-3">
          <Bar w="65%" className="!h-3 !bg-white !rounded" />
          <Bar w="40%" className="!bg-zinc-500" />
          <div className="space-y-1.5 pt-1">
            <Bar w="100%" className="!bg-zinc-700" />
            <Bar w="88%" className="!bg-zinc-700" />
            <Bar w="95%" className="!bg-zinc-700" />
          </div>
          <CodeBlock className="border-zinc-800 text-zinc-600 !bg-zinc-900/60" />
          <div className="space-y-1.5">
            <Bar w="90%" className="!bg-zinc-700" />
            <Bar w="72%" className="!bg-zinc-700" />
          </div>
        </div>
        {/* Right TOC */}
        <div className="w-[60px] shrink-0 border-l border-zinc-800 px-3 py-4 space-y-2">
          <Bar w="55%" className="!bg-zinc-600 !h-1.5" />
          <Bar w="80%" className="!bg-sky-500/50" />
          <Bar w="70%" className="!bg-zinc-700" />
          <Bar w="65%" className="!bg-zinc-700" />
          <Bar w="75%" className="!bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

/* ── 3. Dashboard: warm dark, top tabs, card grid layout ── */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#151515] rounded-xl overflow-hidden text-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-sm bg-emerald-500" />
          <Bar w="44px" className="!bg-zinc-300" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-5 w-20 rounded border border-zinc-800 bg-zinc-900" />
          <div className="h-5 w-5 rounded-full bg-zinc-700" />
        </div>
      </div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-5 pt-3 border-b border-zinc-800">
        <div className="px-3 pb-2.5 border-b-2 border-emerald-500">
          <Bar w="36px" className="!bg-white !h-1.5" />
        </div>
        <div className="px-3 pb-2.5">
          <Bar w="28px" className="!bg-zinc-600 !h-1.5" />
        </div>
        <div className="px-3 pb-2.5">
          <Bar w="32px" className="!bg-zinc-600 !h-1.5" />
        </div>
        <div className="px-3 pb-2.5">
          <Bar w="24px" className="!bg-zinc-600 !h-1.5" />
        </div>
      </div>
      {/* Content: heading + card grid */}
      <div className="flex-1 px-5 py-5 space-y-4 overflow-hidden">
        <div>
          <Bar w="55%" className="!h-3.5 !bg-white !rounded" />
          <div className="mt-2 space-y-1.5">
            <Bar w="90%" className="!bg-zinc-700" />
            <Bar w="75%" className="!bg-zinc-700" />
          </div>
        </div>
        {/* Card grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 space-y-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/60" />
            <Bar w="70%" className="!bg-zinc-400 !h-1.5" />
            <Bar w="90%" className="!bg-zinc-700" />
            <Bar w="60%" className="!bg-zinc-700" />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 space-y-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-amber-500/60" />
            <Bar w="65%" className="!bg-zinc-400 !h-1.5" />
            <Bar w="85%" className="!bg-zinc-700" />
            <Bar w="55%" className="!bg-zinc-700" />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 space-y-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-sky-500/60" />
            <Bar w="60%" className="!bg-zinc-400 !h-1.5" />
            <Bar w="80%" className="!bg-zinc-700" />
            <Bar w="70%" className="!bg-zinc-700" />
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 space-y-2">
            <div className="h-2.5 w-2.5 rounded-sm bg-rose-500/60" />
            <Bar w="75%" className="!bg-zinc-400 !h-1.5" />
            <Bar w="88%" className="!bg-zinc-700" />
            <Bar w="50%" className="!bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

const skeletonList: { id: StyleId; Component: () => React.JSX.Element }[] = [
  { id: "minimal", Component: MinimalSkeleton },
  { id: "sidebar", Component: SidebarSkeleton },
  { id: "dashboard", Component: DashboardSkeleton },
];

export function DocsStyleShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % skeletonList.length);
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, []);

  const current = skeletonList[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full"
    >
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1.5 shadow-2xl shadow-black/50">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-zinc-700" />
          <div className="h-2 w-2 rounded-full bg-zinc-700" />
          <div className="h-2 w-2 rounded-full bg-zinc-700" />
          <div className="ml-3 flex-1 h-4 rounded bg-zinc-800 max-w-[140px]" />
        </div>

        {/* Skeleton viewport */}
        <div className="h-[360px] md:h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              <current.Component />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {styles.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setIndex(i)}
            className="relative flex items-center gap-1.5 group"
          >
            <div
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                i === index
                  ? "w-6 bg-white"
                  : "w-1.5 bg-zinc-700 group-hover:bg-zinc-500",
              ].join(" ")}
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
