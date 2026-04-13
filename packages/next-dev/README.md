# @document0/next-dev

Next.js integration for document0: **content changes invalidate the server bundle** in development (same idea as Fumadocs putting docs on the webpack graph), so `DocsSource` re-runs without a sidecar or refresh API.

## Requirements

- **`next dev`** with **webpack** (default for many apps). Custom webpack config is **not** applied when using **`next dev --turbo`** — use `next dev` or `next dev --webpack`.

## Setup

1. **Install**

   ```bash
   pnpm add @document0/next-dev
   ```

2. **Wrap `next.config.ts`**

   ```ts
   import type { NextConfig } from "next";
   import { withDocument0 } from "@document0/next-dev";

   const nextConfig: NextConfig = {
     /* ... */
   };

   export default withDocument0({ contentDir: "content/docs" })(nextConfig);
   ```

   `contentDir` is relative to the Next project root and defaults to **`content/docs`**.

3. **Import the content stamp once** next to your `DocsSource` (typically `lib/source.ts`)

   ```ts
   import "@document0/next-dev/content-stamp";
   ```

   Place it in the **same module** that constructs `new DocsSource(...)` so webpack can invalidate that module when files under `contentDir` change.

Production builds do not use the loader; the stamp stays a harmless constant.
