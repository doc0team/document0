# document0

A documentation framework with a headless data layer. File system source, page trees, navigation, MDX processing, and Shiki syntax highlighting, with zero UI. Bring your own components and styles.

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/doc0team/document0)

## Packages

| Package | Description |
|---|---|
| [`@document0/core`](./packages/core) | FS source, page tree, navigation, search |
| [`@document0/mdx`](./packages/mdx) | MDX compilation, frontmatter, Shiki, remark/rehype plugins |

## Quick Start

```bash
# Install both packages
npm install @document0/core @document0/mdx
```

### 1. Structure your content

```
content/
└── docs/
    ├── _meta.json
    ├── index.mdx
    ├── getting-started.mdx
    └── guides/
        ├── _meta.json
        ├── index.mdx
        └── installation.mdx
```

### 2. Load pages and build a tree

```ts
import { DocsSource, buildPageTree } from "@document0/core";

const source = new DocsSource({
  rootDir: "./content/docs",
  baseUrl: "/docs",
});

const pages = source.getPages();
const tree = buildPageTree(pages, "./content/docs");
```

### 3. Process MDX with Shiki

```ts
import { processMdx } from "@document0/mdx";
import { createHighlighter } from "shiki";

const highlighter = await createHighlighter({
  themes: ["github-dark"],
  langs: ["typescript", "javascript", "bash"],
});

const { code, frontmatter, toc } = await processMdx(fileContent, {
  highlighter,
});
```

### 4. Render with your own components

```tsx
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

const { default: MDXContent } = await run(code, {
  ...runtime,
  baseUrl: import.meta.url,
});

// Your component library, your styles - fully headless
export function DocsPage({ slug }) {
  return (
    <MDXContent
      components={{
        h1: ({ children }) => <h1 className="my-heading">{children}</h1>,
        pre: ({ children }) => <pre className="my-codeblock">{children}</pre>,
        // ...any component you want
      }}
    />
  );
}
```

### 5. Navigation

```ts
import { getBreadcrumbs, getPageNeighbours, isActiveOrAncestor } from "@document0/core";

const breadcrumbs = getBreadcrumbs(tree, currentUrl);
const { previous, next } = getPageNeighbours(tree, currentUrl);
```

### 6. Search

```ts
import { createSearchRoute } from "@document0/core";

// In your API route (e.g. app/internal/search/route.ts)
export const { GET } = createSearchRoute(source);
```

## Ordering pages with `_meta.json`

Place a `_meta.json` in any content directory to control ordering, labels, and separators:

```json
{
  "title": "Guides",
  "pages": [
    "introduction",
    "installation",
    "--- ",
    "--- Advanced",
    "configuration",
    "deployment"
  ],
  "defaultOpen": true
}
```

- `"---"` inserts an unnamed separator
- `"--- Label"` inserts a labelled separator

## Frontmatter

Standard frontmatter fields:

```yaml
---
title: My Page
description: A short description shown in search results and meta tags
icon: rocket
full: true
---
```

## License

MIT
