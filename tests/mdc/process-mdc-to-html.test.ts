import { describe, expect, it } from "vitest";
import { processMdcToHtml } from "../../packages/mdc/src/processor.js";

describe("mdc/processMdcToHtml", () => {
  it("returns frontmatter, toc, and rendered html", async () => {
    const source = `---
title: MDC Page
---

## Section Title

Hello from MDC.
`;

    const result = await processMdcToHtml(source);

    expect(result.frontmatter.title).toBe("MDC Page");
    expect(result.toc.some((h) => h.id === "section-title" && h.depth === 2)).toBe(
      true,
    );
    expect(result.html).toContain("Section Title");
  });
});
