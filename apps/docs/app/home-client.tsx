"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import HeroGeometric from "@/components/ui/hero-geometric";
import { HighlightedCode } from "@/components/highlighted-code";
import { motion } from "framer-motion";
import { Check, ChevronDown, Copy, Braces, FileCode, Folder } from "lucide-react";

const INSTALL_CMD = "npx create-document0";

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

function WindowChrome({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-zinc-800/90 bg-[#1e1e1e] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.65)]">
      <div className="flex h-9 shrink-0 items-center gap-2.5 border-b border-black/40 bg-[#323232] px-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="select-none text-[11px] text-zinc-400">{title}</span>
      </div>
      {children}
    </div>
  );
}

function CopyInstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="inline-flex max-w-full items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/70 py-2 pl-3.5 pr-1.5 font-mono text-sm text-zinc-300">
      <span className="shrink-0 text-zinc-600 select-none" aria-hidden>
        $
      </span>
      <span className="min-w-0 truncate">{INSTALL_CMD}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden">
      <div className="absolute inset-0">
        <HeroGeometric
          className="!min-h-full"
          color1="#0a0a0a"
          color2="#3a3a3a"
          speed={1.0}
        />
      </div>

      <div className="relative z-10">
        <div className="flex min-h-[calc(100svh-4rem)] items-center">
          <div className="w-full max-w-[560px] px-5 py-16 sm:px-8">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} custom={0}>
                <span className="mb-6 inline-block text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Open Source &middot; MIT Licensed
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.1}
                className="text-[3.2rem] leading-[1.08] tracking-tight text-zinc-100 md:text-[4rem]"
                style={{ fontFamily: "var(--font-geist-pixel-square)" }}
              >
                shadcn for
                <br />
                <span className="text-zinc-500">documentation.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={0.2} className="mt-7 text-lg leading-relaxed text-zinc-400">
                A headless docs framework with a namespaced registry for UI components and plugins. Install source, not
                packages.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.3} className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/docs"
                  className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
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
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900/80"
                >
                  Explore Registry
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} custom={0.4} className="mt-6">
                <CopyInstallCommand />
              </motion.div>

              <motion.div variants={fadeUp} custom={0.5} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-500">
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

const terminalLines = [
  { type: "cmd" as const, text: "npx @document0/cli add acme/sidebar" },
  { type: "out" as const, text: "Fetched acme/sidebar" },
  { type: "out" as const, text: "Created components/sidebar/Sidebar.tsx" },
  { type: "done" as const, text: "Done." },
  { type: "gap" as const, text: "" },
  { type: "cmd" as const, text: "npx @document0/cli add document0/search-dialog" },
  { type: "out" as const, text: "Fetched document0/search-dialog" },
  { type: "out" as const, text: "Created components/search-dialog/SearchDialog.tsx" },
  { type: "done" as const, text: "Done." },
  { type: "gap" as const, text: "" },
  { type: "cmd" as const, text: "npx @document0/cli add acme/changelog" },
  { type: "out" as const, text: "Fetched acme/changelog" },
  { type: "out" as const, text: "Created components/changelog/Changelog.tsx" },
  { type: "done" as const, text: "Done." },
];

function AnimatedTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    if (visibleLines >= terminalLines.length) return;

    const line = terminalLines[visibleLines];

    if (line.type === "cmd") {
      const fullCmd = line.text;
      if (typedChars < fullCmd.length) {
        const t = window.setTimeout(() => setTypedChars((c) => c + 1), 22);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => {
        setVisibleLines((v) => v + 1);
        setTypedChars(0);
      }, 180);
      return () => window.clearTimeout(t);
    }

    if (line.type === "gap") {
      const t = window.setTimeout(() => {
        setVisibleLines((v) => v + 1);
        setTypedChars(0);
      }, 320);
      return () => window.clearTimeout(t);
    }

    const t = window.setTimeout(() => {
      setVisibleLines((v) => v + 1);
      setTypedChars(0);
    }, line.type === "done" ? 260 : 70);
    return () => window.clearTimeout(t);
  }, [started, visibleLines, typedChars]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      onViewportEnter={() => setStarted(true)}
      variants={fadeUp}
      custom={0.12}
      className="mx-auto max-w-xl"
    >
      <WindowChrome title="Terminal — zsh">
        <div className="bg-[#0c0c0c] px-4 py-3.5 font-mono text-[13px] leading-6 text-zinc-300">
          <div className="min-h-[240px]">
            {terminalLines.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={line.type === "gap" ? "h-2" : ""}>
                {line.type === "cmd" && (
                  <div>
                    <span className="text-emerald-600/90">❯</span> <span className="text-zinc-200">{line.text}</span>
                  </div>
                )}
                {line.type === "out" && <div className="pl-4 text-zinc-500">{line.text}</div>}
                {line.type === "done" && <div className="pl-4 text-emerald-500/90">{line.text}</div>}
              </div>
            ))}
            {visibleLines < terminalLines.length && terminalLines[visibleLines]?.type === "cmd" && (
              <div>
                <span className="text-emerald-600/90">❯</span>{" "}
                <span className="text-zinc-200">{terminalLines[visibleLines].text.slice(0, typedChars)}</span>
                <span className="inline-block w-2 animate-pulse text-zinc-500">▍</span>
              </div>
            )}
            {visibleLines >= terminalLines.length && (
              <div className="mt-1">
                <span className="text-emerald-600/90">❯</span> <span className="inline-block w-2 animate-pulse text-zinc-500">▍</span>
              </div>
            )}
          </div>
        </div>
      </WindowChrome>
    </motion.div>
  );
}

function RegistryStory() {
  return (
    <section className="border-t border-zinc-800 bg-[#0a0a0a] px-5 py-28 sm:px-8">
      <div className="mx-auto max-w-screen-xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0} className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 md:text-4xl">One command. Any namespace.</h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              Teams publish UI components and plugins under their namespace. Install source code directly into your project.
            </p>
          </motion.div>

          <AnimatedTerminal />
        </motion.div>
      </div>
    </section>
  );
}

type ExplorerRow = {
  depth: number;
  name: string;
  kind: "folder" | "mdx" | "json";
  active?: boolean;
};

const explorerTree: ExplorerRow[] = [
  { depth: 0, name: "_meta.json", kind: "json" },
  { depth: 0, name: "index.mdx", kind: "mdx" },
  { depth: 0, name: "installation.mdx", kind: "mdx" },
  { depth: 0, name: "quickstart.mdx", kind: "mdx", active: true },
  { depth: 0, name: "guides", kind: "folder" },
  { depth: 1, name: "theming.mdx", kind: "mdx" },
  { depth: 1, name: "plugins.mdx", kind: "mdx" },
  { depth: 0, name: "api-reference", kind: "folder" },
  { depth: 1, name: "core.mdx", kind: "mdx" },
];

function ExplorerIcon({ kind }: { kind: ExplorerRow["kind"] }) {
  if (kind === "folder") {
    return <Folder className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.5} />;
  }
  if (kind === "json") {
    return <Braces className="h-3.5 w-3.5 shrink-0 text-amber-500/80" strokeWidth={1.5} />;
  }
  return <FileCode className="h-3.5 w-3.5 shrink-0 text-sky-500/80" strokeWidth={1.5} />;
}

function CodeShowcase() {
  return (
    <section className="border-t border-zinc-800 bg-[#0a0a0a] px-5 py-28 sm:px-8">
      <div className="mx-auto max-w-screen-xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={fadeUp} custom={0} className="mb-14 max-w-xl">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 md:text-4xl">
              Drop files.
              <br />
              <span className="text-zinc-500">Get everything else.</span>
            </h2>
            <p className="mt-4 leading-relaxed text-zinc-400">
              Your content lives as MDX files in your repo. document0 turns them into page trees, navigation, search indexes,
              and highlighted code, ready for whatever UI you build.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={0.12} className="grid gap-4 md:grid-cols-2 md:gap-5">
            <WindowChrome title="app/docs/[[...slug]]/page.tsx">
              <div className="bg-[#0c0c0c] p-4">
                <HighlightedCode
                  code={`import { DocsSource } from "@document0/core"
import { processMdx } from "@document0/mdx"

const source = new DocsSource({
  rootDir: "./content/docs",
})

const page = source.getPage("quickstart")
const { code, toc } = await processMdx(page.raw)`}
                  lang="tsx"
                  theme="github-dark"
                />
              </div>
            </WindowChrome>

            <WindowChrome title="content/docs">
              <div className="flex min-h-[280px] flex-col bg-[#0c0c0c] md:min-h-0">
                <div className="flex items-center gap-1.5 border-b border-zinc-800/80 px-3 py-2">
                  <ChevronDown className="h-3 w-3 text-zinc-600" strokeWidth={2} />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">Explorer</span>
                </div>
                <div className="flex-1 py-2">
                  {explorerTree.map((row) => (
                    <div
                      key={`${row.depth}-${row.name}`}
                      className={`flex items-center gap-2 py-0.5 pr-2 text-[12px] leading-6 ${
                        row.active ? "bg-zinc-800/40 text-zinc-100" : "text-zinc-400"
                      }`}
                      style={{ paddingLeft: `${10 + row.depth * 14}px` }}
                    >
                      {row.kind === "folder" ? (
                        <ChevronDown className="h-3 w-3 shrink-0 text-zinc-600" strokeWidth={2} />
                      ) : (
                        <span className="inline-block w-3 shrink-0" aria-hidden />
                      )}
                      <ExplorerIcon kind={row.kind} />
                      <span className="truncate font-mono">{row.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </WindowChrome>
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
    <section className="border-t border-zinc-800 bg-[#0a0a0a] px-5 py-28 sm:px-8">
      <div className="mx-auto max-w-screen-xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
          <motion.div variants={fadeUp} custom={0} className="mb-14 max-w-xl">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100 md:text-4xl">
              Everything you need.
              <br />
              <span className="text-zinc-500">Nothing you don&apos;t.</span>
            </h2>
          </motion.div>

          <div className="grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeUp} custom={i * 0.05}>
                <h3 className="mb-2 text-base font-semibold text-zinc-100">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
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
    <section className="border-t border-zinc-800 bg-[#0a0a0a] px-5 py-32 sm:px-8">
      <div className="mx-auto max-w-screen-xl text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold tracking-tight text-zinc-100 md:text-5xl">
            Don&apos;t keep fighting your
            <br />
            docs framework when you can
            <br />
            build <em className="italic text-zinc-400">without limits.</em>
          </motion.h2>
          <motion.div variants={fadeUp} custom={0.15} className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200"
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
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-900/80"
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
    <footer className="border-t border-zinc-800 bg-[#0a0a0a]">
      <div className="mx-auto max-w-screen-xl px-5 pt-14 pb-8 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <span className="text-base tracking-tight text-zinc-100" style={{ fontFamily: "var(--font-geist-pixel-square)" }}>
              document0
            </span>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Headless documentation framework.
              <br />
              Zero UI, full control.
            </p>
            <p className="mt-4 text-xs text-zinc-600">
              &copy; {new Date().getFullYear()} document0 &middot; MIT License
            </p>
          </div>
          <div className="flex flex-wrap gap-14">
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    Docs
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/plugins" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    Plugins
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs/installation" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    Installation
                  </Link>
                </li>
                <li>
                  <Link href="/docs/guides" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="/llms.txt" className="text-sm text-zinc-400 transition-colors hover:text-zinc-100">
                    llms.txt
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Community</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://github.com/doc0team/document0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    GitHub
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/doc0team/document0/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    Issues
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function HomePageClient() {
  return (
    <>
      <Hero />
      <RegistryStory />
      <CodeShowcase />
      <Features />
      <CtaSection />
      <Footer />
    </>
  );
}
