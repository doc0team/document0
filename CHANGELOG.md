# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Each release may begin with **`### Summary`** — a short blurb shown in the changelog page sidebar; the detailed **Added** / **Changed** / **Fixed** sections stay as usual.

## [Unreleased]

### Summary

_Reserved for the next release._

## [0.6.0] - 2026-04-04

### Summary

Introduced the **OpenRouter AI Chat component** (`document0/openrouter-chat`) featuring streaming, documentation search context injected via Vercel AI SDK, and inline Shiki highlighting, plus critical hydration and UI bug fixes.

### Added

- **Registry (`document0/openrouter-chat`)** — **`index.ts`** server helper: Vercel **AI SDK** streaming chat through **OpenRouter**, with a **`search`** tool wired to documentation context (`zod` schemas). **`AiChat.tsx`**: slide-out sheet, user/assistant messages, **Shiki**-highlighted fenced code, lightweight markdown for assistant text, **hover-to-reveal** code copy, resizable sheet width with persistence.
- **docs app** — **`app/api/chat/route.ts`** delegates to the openrouter-chat plugin; docs-specific layout mounts **`AiChat`**; **`tsconfig`** path **`@registry/*`** → `registry/*` for cleaner imports.

### Fixed

- **`registry/ui/document0/sidebar` (`MobileSidebar`)** — **Portal** backdrop and **`document.body` scroll lock** run only **after mount**, avoiding SSR/client HTML mismatches from `createPortal`.
- **`registry/ui/document0/openrouter-chat` (`AiChat`)** — Fixed `Cannot read properties of undefined (reading 'trim')` crash when initialized.

## [0.5.0] - 2026-04-04

### Summary

Vue and **Next.js** scaffolds (`template-vue`, `template-nextjs`), **`@document0/mdc`**, **`processMdxToHtml`**, a larger registry (Vue UI, Fumadocs-style blocks), docs/plugins UX, and layout fixes for sticky nav.

### Added

- **`@document0/mdc`** — New package for **MDC (Markdown Components)**: unified pipeline with `remark-mdc`, `remark-gfm`, frontmatter via `gray-matter`, rehype (raw, slug, stringify), and **Shiki** highlighting via `@shikijs/rehype`. Exports `processMdc` / `processMdcToHtml`, AST types (`MdcRoot`, `MdcNode`, `TocEntry`, etc.), and `rehypeShiki` / `rehypeStripShikiStyle` helpers.
- **`@document0/mdx`** — `processMdxToHtml` (`html-processor.ts`): compile Markdown/MDX to a **standalone HTML string** (unified remark → rehype → stringify) with the same GFM, optional Shiki, and **TOC extraction** as the JSX-oriented processor, without requiring React at runtime.
- **`packages/template-nextjs`** — Standalone **Next.js** starter (App Router docs layout, shadcn-style UI primitives, MDX wiring, sample `content/docs`). Replaces the old single `packages/template` layout for published tarballs.
- **`packages/template-vue`** — Standalone **Vue 3 + Vite** starter: `MdcRenderer.vue` using `@document0/mdc`, doc shell with `MobileSidebar`, **dev server** that serves processed MDX/Markdown (`server/api.ts`), and **prerender** script (`server/prerender.ts`) for static HTML output.
- **`create-document0`** — Interactive **framework choice** (Next.js vs Vue); copies `template-nextjs` or `template-vue`; rewrites `package.json` **`name`**; strips **`workspace:`** dependency specifiers so generated projects install from npm; prints correct **dev URL** (`/docs` vs Vite default port).
- **`apps/vue-preview`** — Vite + Vue app to **preview registry Vue components**: build plugin copies `registry/ui` → `.registry/ui`, resolves imports for live component previews; **`vercel.json`** for deployment; supports **`VUE_PREVIEW_URL`** from the main docs app for iframe previews.
- **Registry (`document0-vue`)** — Vue ports and previews: **Sidebar** / **SidebarNode**, **TableOfContents**, **Breadcrumbs**, **PageNavigation**, **SearchDialog**.
- **Registry (`fumadocs`)** — Documentation-style UI building blocks: **Accordion**, **Banner**, **CodeBlock**, **Files**, **Steps** (plus `steps.css`), **Tabs**; docs app includes matching **preview** entry points under `components/previews/`.
- **`apps/docs/lib/source.ts`** — Loads **`registry/registry-index.json`**, exposes **`getRegistry`**, **`getItemBySlug`**, **`getItemSource`** (reads plugin/UI source from `registry/plugins` or `registry/ui`), and **`getPluginsTree()`** for the plugins navigation tree.
- **Documentation (MDX)** — New or expanded pages: **`mdc`**, **`search`**, **`llms-txt`**, **`meta-json`**, **`custom-components`** (evolved from the old guides index); per-stack guides **`nextjs`**, **`vue`**, **`react-vite`**, **`svelte`**, **`astro`**, **`angular`**; **`_meta.json`** nav sections (Getting Started, API Reference, Tooling, Guides, Frameworks). **`cli.mdx`** expanded; **`core.mdx`**, **`installation`**, **`quickstart`**, and **`index`** updated for multi-framework and new APIs.
- **Plugins section UX** — **`/plugins`** index with **search** and CLI preview; per-item pages use **Shiki** for source, **copy** control, and **dynamic React previews** for `document0/*` and `fumadocs/*` items; optional **Vue iframe** previews when `VUE_PREVIEW_URL` is set.
- **Root `package.json`** — Declares **`license`**: MIT; scripts **`build:mdc`**, **`dev:mdc`**, **`typecheck:mdc`**, **`dev:docs`** (docs + vue-preview); **`build`** excludes **`template-nextjs`** from the generic `packages/*` build (template is not a library artifact).
- **`scripts/bump-version.mjs`** — Version bumps now include **`packages/mdc`**, **`template-nextjs`**, and **`template-vue`** (no longer `packages/template`).
- **`LICENSE`** — MIT license file at repo root (copyright notice as committed).
- **`README.md`** — DeepWiki “Ask” badge link.

### Removed

- **docs app** — Deleted local **`sidebar.tsx`**, **`search-dialog.tsx`**, **`breadcrumbs.tsx`**, **`page-navigation.tsx`**, and **`table-of-contents.tsx`** under **`apps/docs/components/`** (replaced by registry imports; see **Changed**).

### Changed

- **docs app UI source of truth** — Sidebar, search dialog, breadcrumbs, page navigation, and TOC are imported from **`registry/ui/document0/...`** so the docs site matches the CLI-shipped components.
- **Plugins sidebar data model** — **`getPluginsTree()`** groups items by **registry `category`**: separators **Plugins** (nested folders **MDX**, **Core**) and **UI Components**; UI entries are grouped by **base namespace** with **framework subfolders** when multiple variants exist (e.g. `document0` vs `document0-vue`), using namespace suffix rules (`-vue`, `-react`, etc.).
- **`@document0/core`** — **`BreadcrumbItem.url`** is now **optional** (`string | undefined`) for trees that supply display-only crumbs.
- **`@document0/cli` `add`** — After installing files, detects **`.css`** assets from the registry item and prints **explicit `@import`** hints for the user’s global stylesheet.
- **Registry index** — Large expansion: new namespaces, items, framework metadata, and install paths for the above UI and plugin entries.
- **pnpm lockfile** and workspace **package manifests** updated for new apps, templates, and AI / Shiki / MDC-related dependencies.

### Fixed

- **Sticky layout** — Docs shell no longer uses **`overflow-x-hidden`** (which broke **`position: sticky`** for sidebar/TOC). **`html` / `body`** use **`overflow-x: clip`** instead of `hidden`; the main **prose** wrapper uses **`overflow-x-auto`** so wide content scrolls without trapping sticky descendants.
- **vue-preview / Vite / Vercel** — Build and deploy fixes for the preview app (including mobile-oriented layout adjustments where applicable).

## [0.4.0] - 2026-03-29

### Summary

**DocsSource** instance cache, **O(1)** page lookup via slug/url maps, **`_meta.json` only** for folder meta, less disk I/O for **llms.txt**, and **CLI lockfile** / registry namespace updates.

### Removed
Remove the now unused fs import and stripFrontMatter helper.

### Changed

- Added `_cache = new Map<string, unknown>()` to `DocsSource` - a generic instance-scoped cache that any module can use. `invalidate()` now also calls `this._cache.clear()`. Removed module-level cachedDb and cachedSourceRef singletons. `getOrCreateDb()` now reads/writes via `source._cache` using a `_searchDb` key. Each `DocsSource` instance gets its own isolated Orama DB, and it's automatically cleared on `invalidate()`. This fixes the singleton anti-pattern. Multiple `DocsSource` instances now each maintain their own search index, and hot-reload works correctly via `invalidate()`.

- Removed the _meta.ts and _meta.js candidates that were never actually supported. Only _meta.json is now supported. Now directly checks for _meta.json only, consistent with readMetaFromDir in tree/index.ts.

- generateLlmsFullTxt - replaced fs.readFileSync(page.filePath) + stripFrontMatter() with page.content (already in memory, already fronmatter-stripped by gray-matter during scan).
- getPageRawContent - same fix as above. No more redundant disk reads at request time. 

- Added _slugMap and _urlMap (`Map<string, PageData>`) fields, populated once when getPages() first loads.
- getpage(slug) - now 0(1) via _slugMap.get(slug) instead of .find()
- getPageByUrl(url) - now 0(1) via _urlMap.get(url) instead of .find()

- Added lockfile for component/plugin versions. Update CLI commands for update command. Update registry-index for namespaces

## [0.3.0] - 2026-03-29

### Summary

Search is **Orama-only** via **`createSearchRoute`**; legacy **`buildSearchIndex`**, **`searchPages`**, and the **`SearchIndex`** type are removed.

### Removed

- **`buildSearchIndex`** and **`searchPages`** — Legacy sync search API removed from `@document0/core`. Use `createSearchRoute` instead.
- **`SearchIndex`** type removed from `@document0/core`. Use `SearchResult` instead.

### Changed

- **`buildOpenAPISearchIndex`** now returns `SearchResult[]` instead of the removed `SearchIndex[]`.
- **`createSearchRoute`** (Orama-backed, async, with fuzzy matching and relevance ranking) is now the single canonical search API.
- Documentation and registry references updated to point at `createSearchRoute`.
- Added `_cache = new Map<string, unknown>()` to `DocsSource` - a generic instance-scoped cache that any module can use. `invalidate()` now also calls `this._cache.clear()`. Removed module-level cachedDb and cachedSourceRef singletons. `getOrCreateDb()` now reads/writes via `source._cache` using a `_searchDb` key. Each `DocsSource` instance gets its own isolated Orama DB, and it's automatically cleared on `invalidate()`. This fixes the singleton anti-pattern. Multiple `DocsSource` instances now each maintain their own search index, and hot-reload works correctly via `invalidate()`.
