/**
 * Pre-build script: copies registry/ui preview files into apps/vue-preview/.registry
 * so the app is self-contained for deployment (no relative paths outside project root).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const registryRoot = path.resolve(projectRoot, "../../registry/ui");
const dest = path.join(projectRoot, ".registry", "ui");

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

// Clean previous copy
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

if (!fs.existsSync(registryRoot)) {
  console.warn("Registry root not found at", registryRoot);
  console.warn("Creating empty .registry/ui directory");
  fs.mkdirSync(dest, { recursive: true });
  process.exit(0);
}

console.log("Copying registry/ui →", dest);
copyDir(registryRoot, dest);
console.log("Done.");
