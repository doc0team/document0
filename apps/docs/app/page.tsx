"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import HeroGeometric from "@/components/ui/hero-geometric";
import { PixelLogo } from "@/components/ui/pixel-logo";
import { Selectable } from "@/components/selectable";

export default function Home() {
  const [sel, setSel] = useState<string | null>("design");
  const [resetTrigger, setResetTrigger] = useState(0);
  const [dirtyCount, setDirtyCount] = useState(0);
  const select = useCallback((id: string) => setSel(id), []);
  const deselect = useCallback(() => setSel(null), []);
  const reset = useCallback(() => {
    setResetTrigger((t) => t + 1);
    setSel(null);
  }, []);
  const onDirtyChange = useCallback((dirty: boolean) => {
    setDirtyCount((c) => c + (dirty ? 1 : -1));
  }, []);
  const hasDirty = dirtyCount > 0;

  return (
    <div className="bg-[#0a0a0a]">
      <div className="relative min-h-screen">
        <HeroGeometric
          className="!min-h-screen !bg-[#0a0a0a]"
          color1="#0a0a0a"
          color2="#71717a"
          speed={0.8}
        />

        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div className="absolute inset-0 z-20 flex flex-col" onClick={deselect}>
          {/* Nav */}
          <nav className="flex items-center justify-between px-6 py-5 max-w-screen-xl mx-auto w-full">
            <span
              className="text-base tracking-tight text-white"
              style={{ fontFamily: "var(--font-geist-pixel-square)" }}
            >
              document0
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              className={`group flex items-center gap-1.5 rounded-full border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white hover:border-zinc-500 transition-all duration-300 ${hasDirty ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}
            >
              <svg
                className="h-3 w-3 transition-transform duration-300 group-hover:-rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 1 3 6.7" />
                <path d="M3 22v-6h6" />
              </svg>
              Reset
            </button>
            <div className="flex items-center gap-4">
              <Link
                href="/docs"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Docs
              </Link>
              <Link
                href="https://github.com/your-org/document0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                GitHub
              </Link>
            </div>
          </nav>

          {/* Hero + Features */}
          <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <div className="mb-10">
              <Selectable selected={sel === "logo"} onSelect={() => select("logo")} resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.05 }}
                >
                  <PixelLogo size={120} interactive={sel !== "logo"} />
                </motion.div>
              </Selectable>
            </div>

            {/* Centered content */}
            <div className="flex flex-col items-center text-center max-w-2xl">
              {/* Badge */}
              <div className="mb-5">
                <Selectable selected={sel === "badge"} onSelect={() => select("badge")} resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-zinc-300 shadow-sm">
                      Open Source
                    </span>
                  </motion.div>
                </Selectable>
              </div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
              >
                <Selectable selected={sel === "you"} onSelect={() => select("you")} inline resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                  You
                </Selectable>{" "}
                <Selectable selected={sel === "design"} onSelect={() => select("design")} inline resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                  design.
                </Selectable>
                <br />
                <Selectable selected={sel === "subtitle"} onSelect={() => select("subtitle")} inline resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                  <span className="text-zinc-500">We handle the rest.</span>
                </Selectable>
              </motion.h1>

              {/* Description */}
              <div className="mt-6">
                <Selectable selected={sel === "desc"} onSelect={() => select("desc")} resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.35 }}
                    className="text-base md:text-lg leading-relaxed text-zinc-400 max-w-lg"
                  >
                    File-system source, page trees, MDX, search, and syntax
                    highlighting — zero UI lock-in. Same content, any look.
                  </motion.p>
                </Selectable>
              </div>

              {/* CTAs — not selectable per user request */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-lg shadow-white/10 hover:bg-zinc-200 transition-colors"
                >
                  Get Started
                  <svg
                    className="ml-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="https://github.com/your-org/document0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-700/80 bg-zinc-900/60 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-zinc-300 shadow-sm hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </Link>
              </motion.div>

              {/* Install snippet */}
              <div className="mt-6">
                <Selectable selected={sel === "install"} onSelect={() => select("install")} resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.65 }}
                  >
                    <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-900/60 backdrop-blur-sm px-4 py-2.5 font-mono text-sm text-zinc-300 shadow-sm">
                      <span className="text-zinc-500 select-none">$</span>
                      <span>pnpm add @document0/core</span>
                    </div>
                  </motion.div>
                </Selectable>
              </div>
            </div>
          </div>

          {/* Features row */}
          <Selectable selected={sel === "features"} onSelect={() => select("features")} resetTrigger={resetTrigger} onDirtyChange={onDirtyChange}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="pb-10 px-6"
            >
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-zinc-500">
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  File-system routing
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  Orama search
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  Shiki highlighting
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  LLMs.txt ready
                </span>
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Framework agnostic
                </span>
              </div>
            </motion.div>
          </Selectable>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-[#0a0a0a] overflow-hidden">
        {/* Top content area */}
        <div className="border-t border-zinc-800">
          <div className="max-w-screen-xl mx-auto px-6 pt-16 pb-8">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-10">
              <div className="max-w-xs">
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Headless documentation framework.
                  <br />
                  Zero UI, full control.
                </p>
                <p className="mt-4 text-xs text-zinc-700">
                  &copy; {new Date().getFullYear()} document0 &middot; MIT License
                </p>
              </div>
              <div className="flex gap-14">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Product</h4>
                  <ul className="space-y-2">
                    <li><Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">Docs</Link></li>
                    <li><Link href="/api" className="text-sm text-zinc-400 hover:text-white transition-colors">API Reference</Link></li>
                    <li><Link href="/docs/quickstart" className="text-sm text-zinc-400 hover:text-white transition-colors">Quickstart</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Resources</h4>
                  <ul className="space-y-2">
                    <li><Link href="/docs/installation" className="text-sm text-zinc-400 hover:text-white transition-colors">Installation</Link></li>
                    <li><Link href="/docs/guides" className="text-sm text-zinc-400 hover:text-white transition-colors">Guides</Link></li>
                    <li><Link href="/llms.txt" className="text-sm text-zinc-400 hover:text-white transition-colors">llms.txt</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Community</h4>
                  <ul className="space-y-2">
                    <li><Link href="https://github.com/your-org/document0" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors">GitHub</Link></li>
                    <li><Link href="https://github.com/your-org/document0/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors">Issues</Link></li>
                    <li><Link href="https://github.com/your-org/document0/releases" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors">Releases</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Giant "document0" — only top ~half visible, bottom cropped by overflow-hidden on footer */}
        <div className="relative h-[clamp(70px,10vw,130px)] select-none pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[clamp(140px,22vw,320px)] leading-[0.75] text-zinc-900/50"
            style={{ fontFamily: "var(--font-geist-pixel-square)" }}
          >
            document0
          </div>
        </div>
      </footer>
    </div>
  );
}
