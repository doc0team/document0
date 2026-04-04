"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchDialog } from "../../../registry/ui/document0/search-dialog/SearchDialog";

function NavLinks() {
  const pathname = usePathname();
  const links = [
    { href: "/docs", label: "Docs", match: (p: string) => p.startsWith("/docs") },
    { href: "/api", label: "API Reference", match: (p: string) => p.startsWith("/api") },
    { href: "/plugins", label: "Plugins", match: (p: string) => p.startsWith("/plugins") },
  ];
  return (
    <nav className="flex items-center gap-1 text-sm text-zinc-400 ml-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={[
            "px-3 py-1.5 rounded-md transition-colors",
            link.match(pathname)
              ? "text-white bg-zinc-800"
              : "hover:text-white hover:bg-zinc-800",
          ].join(" ")}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-6 px-4 max-w-screen-xl mx-auto">
          <Link href="/docs" className="flex items-center gap-2 text-white">
            <span
              className="text-base tracking-tight"
              style={{ fontFamily: "var(--font-geist-pixel-square)" }}
            >
              document0
            </span>
          </Link>
          <NavLinks />
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[10px] font-medium text-zinc-500 ml-1">
                ⌘K
              </kbd>
            </button>
            <Link
              href="https://github.com/doc0team/document0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
