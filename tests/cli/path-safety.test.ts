import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  resolveSafeInstallDir,
  resolveSafeTargetFile,
} from "../../packages/cli/src/path-safety.js";

let prevCwd = "";
let tempDir = "";

beforeEach(() => {
  prevCwd = process.cwd();
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "document0-cli-test-"));
  process.chdir(tempDir);
});

afterEach(() => {
  process.chdir(prevCwd);
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("cli/path-safety", () => {
  it("allows install paths inside project root", () => {
    const target = resolveSafeInstallDir("plugins/document0/admonitions");
    expect(target.startsWith(tempDir)).toBe(true);
  });

  it("rejects install path traversal", () => {
    expect(() => resolveSafeInstallDir("../../outside")).toThrow(/Unsafe installPath/);
  });

  it("rejects file path traversal outside install dir", () => {
    const installDir = resolveSafeInstallDir("plugins/document0/admonitions");
    expect(() => resolveSafeTargetFile(installDir, "../escape.ts")).toThrow(
      /Unsafe file path/,
    );
  });
});
