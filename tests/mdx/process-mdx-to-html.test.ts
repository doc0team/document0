import { describe, expect, it } from "vitest";
import { processMdxToHtml } from "../../packages/mdx/src/html-processor.js";

describe("mdx/processMdxToHtml", () => {
  it("returns frontmatter, toc, and rendered html", async () => {
    const source = `---
title: Test Page
---

## Hello World

Some **content**.
`;

    const result = await processMdxToHtml(source);

    expect(result.frontmatter.title).toBe("Test Page");
    expect(result.toc.some((h) => h.id === "hello-world" && h.depth === 2)).toBe(
      true,
    );
    expect(result.html).toContain("<h2 id=\"hello-world\">Hello World</h2>");
  });
});
