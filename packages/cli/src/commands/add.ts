import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import kleur from "kleur";
import {
  fetchRegistryIndex,
  fetchItemFile,
  findItem,
} from "../registry.js";
import { recordInstall } from "../lockfile.js";

function detectPackageManager(): string {
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("bun.lockb")) return "bun";
  return "npm";
}

function installCmd(pm: string, deps: string[]): string {
  const joined = deps.join(" ");
  if (pm === "yarn") return `yarn add ${joined}`;
  if (pm === "bun") return `bun add ${joined}`;
  return `${pm} install ${joined}`;
}

export async function add(names: string[]): Promise<void> {
  if (names.length === 0) {
    console.log(kleur.red("  No item names provided."));
    console.log(kleur.dim("  Usage: document0 add <namespace/name> [...]"));
    process.exit(1);
  }

  console.log();
  console.log(kleur.dim("  Fetching registry..."));

  const index = await fetchRegistryIndex();
  const allDeps: Record<string, string> = {};
  const cssFiles: string[] = [];

  for (const name of names) {
    const item = findItem(index, name);
    if (!item) {
      console.log(kleur.red(`  "${name}" not found in registry.`));
      console.log(
        kleur.dim(
          `  Available: ${index.items.map((i) => `${i.namespace}/${i.name}`).join(", ")}`,
        ),
      );
      process.exit(1);
    }

    const fullId = `${item.namespace}/${item.name}`;
    console.log(
      kleur.cyan(`  Installing ${kleur.bold(fullId)}`) +
        kleur.dim(` v${item.version}`),
    );

    const targetDir = path.resolve(process.cwd(), item.installPath);
    fs.mkdirSync(targetDir, { recursive: true });

    for (const file of item.files) {
      const content = await fetchItemFile(item, file);
      const targetPath = path.join(targetDir, file);
      fs.writeFileSync(targetPath, content, "utf-8");
      console.log(kleur.dim(`    → ${item.installPath}/${file}`));
      if (file.endsWith(".css")) {
        cssFiles.push(path.join(item.installPath, file));
      }
    }

    recordInstall(item.namespace, item.name, item.version, item.installPath);
    Object.assign(allDeps, item.dependencies);
  }

  const depsToInstall = Object.entries(allDeps);
  if (depsToInstall.length > 0) {
    const pm = detectPackageManager();
    const depStrings = depsToInstall.map(([k, v]) => `${k}@${v}`);
    console.log();
    console.log(kleur.dim(`  Installing dependencies with ${pm}...`));
    try {
      execSync(installCmd(pm, depStrings), { stdio: "inherit" });
    } catch {
      console.log(
        kleur.yellow(
          `\n  Could not auto-install deps. Run manually:\n    ${installCmd(pm, depStrings)}`,
        ),
      );
    }
  }

  if (cssFiles.length > 0) {
    console.log();
    console.log(kleur.yellow("  CSS files installed — add these imports to your stylesheet:"));
    for (const cssPath of cssFiles) {
      console.log(kleur.cyan(`    @import "./${cssPath}";`));
    }
  }

  console.log();
  console.log(kleur.bold().green("  Done!"));
  console.log();
}
