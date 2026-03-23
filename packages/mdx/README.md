# @document0/mdx

MDX processing for document0. Compiles `.mdx` and `.md` files with frontmatter extraction, GFM support, auto-generated heading IDs, table of contents, and Shiki syntax highlighting — all without any UI.

## Install

```bash
npm install @document0/mdx
# or
pnpm add @document0/mdx
# or
yarn add @document0/mdx
# or
bun add @document0/mdx
```

## Usage

### Basic MDX processing

```ts
import { processMdx } from "@document0/mdx";

const { code, frontmatter, toc } = await processMdx(`
---
title: Getting Started
description: Learn how to get started
---

# Hello World

Some **markdown** content.
`);

console.log(frontmatter); // { title: "Getting Started", description: "..." }
console.log(toc); // [{ id: "hello-world", text: "Hello World", depth: 1 }]
```

The returned `code` is a compiled JS function body that can be executed with a JSX runtime. In a Next.js/React app:

```tsx
import { run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

const { default: MDXContent } = await run(code, { ...runtime, baseUrl: import.meta.url });

// Render with custom components
<MDXContent components={{ h1: MyHeading, pre: MyCodeBlock }} />
```

### With Shiki syntax highlighting

```ts
import { processMdx } from "@document0/mdx";
import { createHighlighter } from "shiki";

const highlighter = await createHighlighter({
  themes: ["github-dark", "github-light"],
  langs: ["typescript", "javascript", "bash", "json"],
});

const { code, frontmatter, toc } = await processMdx(source, {
  highlighter,
  defaultLanguage: "plaintext",
});
```

### With custom remark/rehype plugins

```ts
import { processMdx } from "@document0/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const result = await processMdx(source, {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
});
```

## Plugins

Both plugins are also exported individually for use in your own unified pipeline:

```ts
import { rehypeShiki, remarkToc } from "@document0/mdx/plugins";
```

### `rehypeShiki`

Transforms fenced code blocks into Shiki-highlighted HTML. Requires a pre-created Shiki highlighter instance — this keeps the highlighter lifecycle in your control.

### `remarkToc`

Extracts headings into a table-of-contents array via an `onToc` callback. Does not inject any HTML.

## License

MIT
