import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DocsSource } from "../../packages/core/src/source/index.js";

const tempDirs: string[] = [];

function mkTempDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "document0-core-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("core/DocsSource", () => {
  it("reloads content after invalidate()", () => {
    const rootDir = mkTempDir();
    const filePath = path.join(rootDir, "index.mdx");
    fs.writeFileSync(filePath, "---\ntitle: Home\n---\n\nFirst\n", "utf-8");

    const source = new DocsSource({ rootDir, baseUrl: "/docs" });
    expect(source.getPage("")?.content).toContain("First");

    fs.writeFileSync(filePath, "---\ntitle: Home\n---\n\nUpdated\n", "utf-8");
    source.invalidate();

    expect(source.getPage("")?.content).toContain("Updated");
  });
});
