# @document0/core

The core package for document0. Provides file system source loading, page tree building, navigation utilities, and search indexing, with zero UI assumptions.

## Install

```bash
npm install @document0/core
# or
pnpm add @document0/core
# or
yarn add @document0/core
# or
bun add @document0/core
```

## Usage

### Load pages from the file system

```ts
import { DocsSource } from "@document0/core";

const source = new DocsSource({
  rootDir: "./content/docs",
  baseUrl: "/docs",
});

const pages = source.getPages();
const page = source.getPage("getting-started");
```

### Build a page tree

```ts
import { DocsSource, buildPageTree } from "@document0/core";

const source = new DocsSource({ rootDir: "./content/docs" });
const tree = buildPageTree(source.getPages(), "./content/docs");
```

The tree respects `_meta.json` files in each directory for ordering and naming:

```json
{
  "title": "Getting Started",
  "pages": ["introduction", "installation", "--- Usage", "quickstart"],
  "defaultOpen": true
}
```

Use `"---"` for an unnamed separator, or `"--- Label"` for a labelled separator.

### Navigation utilities

```ts
import { getBreadcrumbs, getPageNeighbours, isActiveOrAncestor } from "@document0/core";

const breadcrumbs = getBreadcrumbs(tree, "/docs/guides/installation");
const { previous, next } = getPageNeighbours(tree, "/docs/guides/installation");
const active = isActiveOrAncestor(node, currentUrl);
```

### Search

```ts
import { createSearchRoute } from "@document0/core";

// In your API route (e.g. app/internal/search/route.ts)
export const { GET } = createSearchRoute(source);
```

### Development: file watching

`DocsSource` caches pages, navigation, and internal search state. Editing markdown or `_meta.json` on disk does not refresh that cache by itself.

**Next.js:** use **`@document0/next-dev`** so the dev bundler invalidates your `DocsSource` module when content changes (see that package’s README).

**Other runtimes (Node only, not Edge):** import **`watchDocsSource`** from **`@document0/core/watch`**. That entry is separate from the main package graph so **chokidar** is not pulled in when you only use `DocsSource`.

```ts
import { watchDocsSource } from "@document0/core/watch";

await watchDocsSource(source, {
  debounceMs: 150,
  onInvalidate: () => {
    // e.g. Vite: server.ws.send({ type: "full-reload" })
  },
});
```

Call **`stopWatchingDocsSource(source)`** when tearing down the dev server if you start the watcher manually.

## Types

```ts
export type TreeNode = PageNode | FolderNode | SeparatorNode;

interface PageNode {
  type: "page";
  name: string;
  url: string;
  slug: string;
  icon?: string;
}

interface FolderNode {
  type: "folder";
  name: string;
  defaultOpen?: boolean;
  index?: PageNode;
  children: TreeNode[];
  icon?: string;
}

interface SeparatorNode {
  type: "separator";
  name: string;
}
```

## License

MIT
