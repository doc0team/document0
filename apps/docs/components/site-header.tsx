"use client";

import Link from "next/link";
import { useState } from "react";

export type SiteHeaderCurrent = "changelog";

const navFont = { fontFamily: "var(--font-geist-pixel-square)" } as const;

function NavItem({
  href,
  label,
  isCurrentPage,
  children,
}: {
  href: string;
  label: string;
  isCurrentPage?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {isCurrentPage ? (
        <span
          className={open ? "text-zinc-100" : "text-zinc-600"}
          style={navFont}
        >
          {label}
        </span>
      ) : (
        <Link
          href={href}
          className={`text-zinc-400 hover:text-zinc-100 ${open ? "text-zinc-100" : ""}`}
          style={navFont}
        >
          {label}
        </Link>
      )}
      {open ? (
        <div className="absolute top-full left-1/2 z-50 mt-2 w-52 -translate-x-1/2 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl shadow-black/50">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({ current }: { current?: SiteHeaderCurrent }) {
  return (
    <header className="border-b border-zinc-800 bg-[#0a0a0a]">
      <nav className="mx-auto flex max-w-3xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-xs font-medium tracking-tight text-zinc-100"
          style={navFont}
        >
          document0
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-4 text-[11px] font-medium">
          <NavItem href="/docs" label="Docs">
            <h3 className="text-sm font-semibold text-white">Docs</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Guides &amp; references</p>
            <div className="mt-3 flex gap-2 rounded-lg bg-zinc-950 p-3">
              <div className="w-1/3 space-y-1.5">
                <div className="h-1.5 w-full rounded-sm bg-zinc-700" />
                <div className="h-1.5 w-3/4 rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-3/4 rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-1/2 rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-3/4 rounded-sm bg-zinc-800" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-2/3 rounded-sm bg-zinc-600" />
                <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-4/5 rounded-sm bg-zinc-800" />
              </div>
            </div>
          </NavItem>

          <NavItem href="/plugins" label="Plugins">
            <h3 className="text-sm font-semibold text-white">Plugin Registry</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Browse &amp; install source</p>
            <div className="mt-3 space-y-1.5 rounded-lg bg-zinc-950 p-3 font-mono text-[9px]">
              <div className="flex gap-2">
                <span className="text-zinc-600">ui</span>
                <span className="text-emerald-400">sidebar</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-600">ui</span>
                <span className="text-emerald-400">toc</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-600">core</span>
                <span className="text-sky-400">reading-time</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-600">mdx</span>
                <span className="text-amber-400">admonitions</span>
              </div>
            </div>
          </NavItem>

          <NavItem href="/api" label="API">
            <h3 className="text-sm font-semibold text-white">API Reference</h3>
            <p className="mt-0.5 text-xs text-zinc-500">OpenAPI endpoints</p>
            <div className="mt-3 space-y-1.5 rounded-lg bg-zinc-950 p-3 font-mono text-[9px]">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-emerald-400">GET</span>
                <span className="text-zinc-400">/pages</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/20 px-1 py-0.5 text-sky-400">POST</span>
                <span className="text-zinc-400">/search</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-amber-500/20 px-1 py-0.5 text-amber-400">GET</span>
                <span className="text-zinc-400">/tree</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-violet-500/20 px-1 py-0.5 text-violet-400">GET</span>
                <span className="text-zinc-400">/registry</span>
              </div>
            </div>
          </NavItem>

          <NavItem href="/changelog" label="Changelog" isCurrentPage={current === "changelog"}>
            <h3 className="text-sm font-semibold text-white">Changelog</h3>
            <p className="mt-0.5 text-xs text-zinc-500">Version history &amp; release notes</p>
            <div className="mt-3 space-y-2.5 rounded-lg bg-zinc-950 p-3">
              <div className="space-y-1.5">
                <div className="h-2 w-[7.5rem] rounded-sm bg-zinc-600" />
                <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-[92%] rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-[88%] rounded-sm bg-zinc-800" />
              </div>
              <div className="space-y-1.5 border-t border-zinc-800/80 pt-1">
                <div className="h-2 w-20 rounded-sm bg-zinc-700" />
                <div className="flex gap-2">
                  <div className="mt-0.5 h-1.5 w-1 shrink-0 rounded-full bg-emerald-500/50" />
                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                    <div className="h-1.5 w-4/5 rounded-sm bg-zinc-800" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="mt-0.5 h-1.5 w-1 shrink-0 rounded-full bg-sky-500/50" />
                  <div className="h-1.5 flex-1 rounded-sm bg-zinc-800" />
                </div>
              </div>
            </div>
          </NavItem>

          <Link
            href="https://github.com/doc0team/document0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-100"
            aria-label="GitHub"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}
