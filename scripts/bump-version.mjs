#!/usr/bin/env node

/**
 * Bumps the version of all packages in the monorepo.
 *
 * Usage:
 *   node scripts/bump-version.mjs patch   # 0.3.0 → 0.3.1
 *   node scripts/bump-version.mjs minor   # 0.3.0 → 0.4.0
 *   node scripts/bump-version.mjs major   # 0.3.0 → 1.0.0
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PACKAGES = [
  "packages/core",
  "packages/mdx",
  "packages/cli",
  "packages/create-document0",
  "packages/template",
];

const type = process.argv[2];
if (!type || !["major", "minor", "patch"].includes(type)) {
  console.error("Usage: node scripts/bump-version.mjs <major|minor|patch>");
  process.exit(1);
}

function bump(version, type) {
  const [major, minor, patch] = version.split(".").map(Number);
  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

let currentVersion = null;
let newVersion = null;

for (const pkg of PACKAGES) {
  const pkgPath = path.join(ROOT, pkg, "package.json");
  const json = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  if (!currentVersion) {
    currentVersion = json.version;
    newVersion = bump(currentVersion, type);
    console.log(`\nBumping all packages: ${currentVersion} → ${newVersion}\n`);
  }

  json.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  console.log(`  ✓ ${json.name} → ${newVersion}`);
}

console.log(`\nDone! All packages bumped to ${newVersion}\n`);
