"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import HeroGeometric from "@/components/ui/hero-geometric";
import { motion, AnimatePresence } from "framer-motion";

const fullText = "document0";

function Intro({ onComplete }: { onComplete: () => void }) {
  const [typedCount, setTypedCount] = useState(0);
  const [eraseCount, setEraseCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [phase, setPhase] = useState<"typing" | "pause" | "erasing" | "hold" | "done">("typing");

  // Typing
  useEffect(() => {
    if (phase !== "typing") return;
    if (typedCount < fullText.length) {
      const t = setTimeout(() => setTypedCount((c) => c + 1), 100);
      return () => clearTimeout(t);
    }
    setPhase("pause");
  }, [phase, typedCount]);

  // Pause after typing
  useEffect(() => {
    if (phase !== "pause") return;
    const t = setTimeout(() => setPhase("erasing"), 600);
    return () => clearTimeout(t);
  }, [phase]);

  // Erasing from the left
  useEffect(() => {
    if (phase !== "erasing") return;
    if (eraseCount < fullText.length - 1) {
      const t = setTimeout(() => setEraseCount((c) => c + 1), 60);
      return () => clearTimeout(t);
    }
    setShowCursor(false);
    setPhase("hold");
  }, [phase, eraseCount]);

  // Hold then complete
  useEffect(() => {
    if (phase !== "hold") return;
    const t = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 800);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // Cursor blink
  useEffect(() => {
    if (phase === "hold" || phase === "done") return;
    const blink = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(blink);
  }, [phase]);

  const displayed = fullText.slice(eraseCount, typedCount);
  const isZeroOnly = phase === "hold" || phase === "done";

  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-[#0a0a0a] flex items-center justify-center"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="flex items-center">
        <span
          className="text-white leading-none select-none"
          style={{
            fontFamily: "var(--font-geist-pixel-square)",
            fontSize: isZeroOnly ? "16rem" : "4rem",
            transition: "font-size 0.4s ease",
          }}
        >
          {displayed}
        </span>
        {!isZeroOnly && (
          <span
            className="text-white leading-none select-none"
            style={{
              fontFamily: "var(--font-geist-pixel-square)",
              fontSize: "4rem",
              opacity: showCursor ? 1 : 0,
              marginLeft: "2px",
            }}
          >
            |
          </span>
        )}
      </div>
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

function NavItem({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href={href} className="text-sm text-black" style={{ fontFamily: "var(--font-geist-pixel-square)" }}>
        {label}
      </Link>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl border border-zinc-200 bg-white shadow-xl p-4">
          {children}
        </div>
      )}
    </div>
  );
}

function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-10 py-6"
    >
      <span
        className="text-base tracking-tight text-zinc-900"
        style={{ fontFamily: "var(--font-geist-pixel-square)" }}
      >
        document0
      </span>
      <div className="flex items-center gap-6 mr-16">
        <NavItem href="/docs" label="Docs">
          <h3 className="text-sm font-semibold text-black">Docs</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Guides & references</p>
          <div className="mt-3 rounded-lg bg-zinc-950 p-3 flex gap-2">
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
          <h3 className="text-sm font-semibold text-black">Plugin Registry</h3>
          <p className="text-xs text-zinc-400 mt-0.5">Browse & install source</p>
          <div className="mt-3 rounded-lg bg-zinc-950 p-3 space-y-1.5 font-mono text-[9px]">
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
          <h3 className="text-sm font-semibold text-black">API Reference</h3>
          <p className="text-xs text-zinc-400 mt-0.5">OpenAPI endpoints</p>
          <div className="mt-3 rounded-lg bg-zinc-950 p-3 space-y-1.5 font-mono text-[9px]">
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

        <Link
          href="https://github.com/doc0team/document0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </Link>
      </div>
    </motion.nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Geometric background - full screen */}
      <div className="absolute inset-0">
        <HeroGeometric
          className="!min-h-full"
          color1="#d4d4d8"
          color2="#ffffff"
          speed={1.0}
        />
      </div>

      <div className="relative z-10">
        <Nav />

        <div className="flex min-h-[calc(100vh-80px)] items-center">
          <div className="w-full max-w-[560px] px-10 py-20">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-block text-xs font-medium uppercase tracking-widest text-zinc-400 mb-6">
                  Open Source &middot; MIT Licensed
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.1}
                className="text-[3.2rem] md:text-[4rem] tracking-tight text-zinc-900 leading-[1.08]"
                style={{ fontFamily: "var(--font-geist-pixel-square)" }}
              >
                shadcn for
                <br />
                <span className="text-zinc-400">documentation.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.2}
                className="mt-7 text-lg text-zinc-500 leading-relaxed"
              >
                A headless docs framework with a namespaced registry for UI
                components and plugins. Install source, not packages.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.3} className="mt-8 flex items-center gap-3">
                <Link
                  href="/docs"
                  className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
                >
                  Get Started
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
                  href="/plugins"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Explore Registry
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={0.4} className="mt-6">
                <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 font-mono text-sm text-zinc-500">
                  <span className="text-zinc-300 select-none">$</span>
                  <span>npx create-document0</span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={0.5} className="mt-10 flex items-center gap-6 text-xs text-zinc-400">
                <span>Namespaced registry</span>
                <span>UI components</span>
                <span>MDX plugins</span>
                <span>Zero lock-in</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistryStory() {
  return (
    <section className="py-28 px-10 bg-white border-t border-zinc-100">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="max-w-xl mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
              Build. Publish. Install.
            </h2>
            <p className="mt-4 text-zinc-500 leading-relaxed">
              Teams build docs UI with full creative control, publish under their namespace,
              and anyone can install source code directly. No npm packages, no version conflicts.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Chapter 1: Build */}
            <motion.div variants={fadeUp} custom={0.08}>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden h-full flex flex-col">
                <div className="px-6 pt-6 pb-4">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-zinc-900 text-white text-xs font-bold">1</span>
                  <h3 className="mt-3 text-base font-semibold text-zinc-900">Build</h3>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                    Your team builds docs UI with full creative control.
                  </p>
                </div>
                <div className="mt-auto border-t border-zinc-200 bg-zinc-100/50">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="ml-2 text-[10px] text-zinc-400 font-mono">Sidebar.tsx</span>
                  </div>
                  <div className="p-4">
                    <pre className="text-[11px] leading-relaxed font-mono text-zinc-600 whitespace-pre">
{`export function Sidebar({
  tree,
  activePath,
}: SidebarProps) {
  return (
    <nav className="w-64">
      {tree.map((node) => (
        <SidebarNode
          key={node.id}
          node={node}
          active={activePath}
        />
      ))}
    </nav>
  )
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapter 2: Publish */}
            <motion.div variants={fadeUp} custom={0.16}>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden h-full flex flex-col">
                <div className="px-6 pt-6 pb-4">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-zinc-900 text-white text-xs font-bold">2</span>
                  <h3 className="mt-3 text-base font-semibold text-zinc-900">Publish</h3>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                    Publish components and plugins under your namespace.
                  </p>
                </div>
                <div className="mt-auto border-t border-zinc-200 bg-zinc-100/50 p-4">
                  <div className="space-y-2">
                    {[
                      { ns: "document0", items: ["sidebar", "toc", "search-dialog"] },
                      { ns: "acme", items: ["sidebar", "api-ref", "changelog"] },
                      { ns: "your-company", items: ["breadcrumbs", "theme-toggle"] },
                    ].map((group) => (
                      <div key={group.ns}>
                        <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                          {group.ns}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map((item) => (
                            <span
                              key={item}
                              className="inline-block rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-mono text-zinc-600"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Chapter 3: Install */}
            <motion.div variants={fadeUp} custom={0.24}>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden h-full flex flex-col">
                <div className="px-6 pt-6 pb-4">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-zinc-900 text-white text-xs font-bold">3</span>
                  <h3 className="mt-3 text-base font-semibold text-zinc-900">Install</h3>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                    Anyone installs source code directly. No npm packages. No version conflicts.
                  </p>
                </div>
                <div className="mt-auto border-t border-zinc-200 bg-zinc-100/50">
                  <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-2.5">
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300" />
                    <span className="ml-2 text-[10px] text-zinc-400 font-mono">terminal</span>
                  </div>
                  <div className="p-4 font-mono text-[11px] space-y-2 text-zinc-600">
                    <div>
                      <span className="text-zinc-400">$</span>{" "}
                      <span className="text-zinc-800">npx @document0/cli add acme/sidebar</span>
                    </div>
                    <div className="text-zinc-400 space-y-0.5">
                      <div>&nbsp; Fetched acme/sidebar</div>
                      <div>&nbsp; Created components/sidebar/Sidebar.tsx</div>
                      <div className="text-emerald-600">&nbsp; Done.</div>
                    </div>
                    <div className="pt-2 border-t border-zinc-200 mt-2">
                      <span className="text-zinc-400">$</span>{" "}
                      <span className="text-zinc-800">npx @document0/cli add acme/api-ref</span>
                    </div>
                    <div className="text-zinc-400 space-y-0.5">
                      <div>&nbsp; Fetched acme/api-ref</div>
                      <div>&nbsp; Created components/api-ref/ApiRef.tsx</div>
                      <div className="text-emerald-600">&nbsp; Done.</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CodeShowcase() {
  return (
    <section className="py-28 px-10 bg-white border-t border-zinc-100">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="max-w-xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
              Drop files.
              <br />
              <span className="text-zinc-400">Get everything else.</span>
            </h2>
            <p className="mt-4 text-zinc-500 leading-relaxed">
              Your content lives as MDX files in your repo. document0 turns them into page trees,
              navigation, search indexes, and highlighted code, ready for whatever UI you build.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.12} className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="ml-3 text-xs text-zinc-400 font-mono">page.tsx</span>
              </div>
              <div className="p-6">
                <pre className="text-[13px] leading-relaxed font-mono text-zinc-700 whitespace-pre">
{`import { DocsSource } from "@document0/core"
import { processMdx } from "@document0/mdx"

const source = new DocsSource({
  rootDir: "./content/docs",
})

const page = source.getPage("quickstart")
const { code, toc } = await processMdx(page.raw)`}
                </pre>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-zinc-200 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
                <span className="ml-3 text-xs text-zinc-400 font-mono">content/docs/</span>
              </div>
              <div className="p-6 space-y-2.5 text-sm font-mono">
                {[
                  { name: "_meta.json", icon: "config" },
                  { name: "index.mdx", icon: "file" },
                  { name: "installation.mdx", icon: "file" },
                  { name: "quickstart.mdx", icon: "file" },
                  { name: "guides/", icon: "folder" },
                  { name: "  theming.mdx", icon: "file" },
                  { name: "  plugins.mdx", icon: "file" },
                  { name: "api-reference/", icon: "folder" },
                  { name: "  core.mdx", icon: "file" },
                ].map((f) => (
                  <div key={f.name} className="flex items-center gap-2.5">
                    {f.icon === "folder" ? (
                      <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                      </svg>
                    ) : f.icon === "config" ? (
                      <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      </svg>
                    )}
                    <span className={f.icon === "folder" ? "text-amber-600" : "text-zinc-600"}>
                      {f.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    title: "Headless by design",
    description: "No CSS shipped. No layout opinions. You bring the UI. We power everything behind it.",
  },
  {
    title: "Full-text search",
    description: "Orama-powered search built in. Index at build time, query instantly at runtime.",
  },
  {
    title: "Shiki highlighting",
    description: "VS Code-quality syntax highlighting at build time. Multi-theme, zero client JS.",
  },
  {
    title: "LLMs.txt ready",
    description: "Auto-generated llms.txt so AI assistants can understand your documentation natively.",
  },
  {
    title: "Framework agnostic",
    description: "Works with Next.js, Astro, Remix, or anything that can import a function.",
  },
];

function Features() {
  return (
    <section className="py-28 px-10 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="max-w-xl mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight leading-tight">
              Everything you need.
              <br />
              <span className="text-zinc-400">Nothing you don&apos;t.</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i * 0.05}>
                <h3 className="text-base font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-32 px-10 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-screen-xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold text-zinc-900 tracking-tight">
            Don&apos;t keep fighting your
            <br />
            docs framework when you can
            <br />
            build <em className="italic">without limits.</em>
          </motion.h2>
          <motion.div variants={fadeUp} custom={0.15} className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Get Started
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
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
              href="https://github.com/doc0team/document0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-white transition-colors"
            >
              GitHub
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="max-w-screen-xl mx-auto px-10 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-10">
          <div className="max-w-xs">
            <span
              className="text-base tracking-tight text-zinc-900"
              style={{ fontFamily: "var(--font-geist-pixel-square)" }}
            >
              document0
            </span>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Headless documentation framework.
              <br />
              Zero UI, full control.
            </p>
            <p className="mt-4 text-xs text-zinc-300">
              &copy; {new Date().getFullYear()} document0 &middot; MIT License
            </p>
          </div>
          <div className="flex gap-14">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/docs" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Docs</Link></li>
                <li><Link href="/api" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">API Reference</Link></li>
                <li><Link href="/plugins" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Plugins</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/docs/installation" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Installation</Link></li>
                <li><Link href="/docs/guides" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Guides</Link></li>
                <li><Link href="/llms.txt" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">llms.txt</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Community</h4>
              <ul className="space-y-2">
                <li><Link href="https://github.com/doc0team/document0" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">GitHub</Link></li>
                <li><Link href="https://github.com/doc0team/document0/issues" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Issues</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function TestHome() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!showIntro) {
      window.scrollTo(0, 0);
    }
  }, [showIntro]);

  return (
    <>
      <AnimatePresence>
        {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      <div className="bg-white text-zinc-900 min-h-screen">
        <Hero />
        <RegistryStory />
        <CodeShowcase />
        <Features />
        <CtaSection />
        <Footer />
      </div>
    </>
  );
}
