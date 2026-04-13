import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import kleur from "kleur";
import {
  fetchRegistryIndex,
  fetchItemFile,
  findItem,
} from "../registry.js";
import { recordInstall } from "../lockfile.js";
import { resolveSafeInstallDir, resolveSafeTargetFile } from "../path-safety.js";

function detectPackageManager(): string {
  if (fs.existsSync("pnpm-lock.yaml")) return "pnpm";
  if (fs.existsSync("yarn.lock")) return "yarn";
  if (fs.existsSync("bun.lockb")) return "bun";
  return "npm";
}

function installInvocation(pm: string, deps: string[]): {
  command: string;
  args: string[];
} {
  const commandBase =
    process.platform === "win32" ? `${pm}.cmd` : pm;

  if (pm === "pnpm") return { command: commandBase, args: ["add", ...deps] };
  if (pm === "yarn") return { command: commandBase, args: ["add", ...deps] };
  if (pm === "bun") return { command: commandBase, args: ["add", ...deps] };
  return { command: commandBase, args: ["install", ...deps] };
}

function displayInvocation(command: string, args: string[]): string {
  return [command, ...args].join(" ");
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

    let targetDir: string;
    try {
      targetDir = resolveSafeInstallDir(item.installPath);
    } catch (err) {
      console.log(kleur.red(`  ${String(err)}`));
      process.exit(1);
    }
    fs.mkdirSync(targetDir, { recursive: true });

    for (const file of item.files) {
      const content = await fetchItemFile(item, file);
      let targetPath: string;
      try {
        targetPath = resolveSafeTargetFile(targetDir, file);
      } catch (err) {
        console.log(kleur.red(`  ${String(err)}`));
        process.exit(1);
      }
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
    const { command, args } = installInvocation(pm, depStrings);

    console.log();
    console.log(kleur.dim(`  Installing dependencies with ${pm}...`));
    try {
      execFileSync(command, args, { stdio: "inherit" });
    } catch {
      console.log(
        kleur.yellow(
          `\n  Could not auto-install deps. Run manually:\n    ${displayInvocation(command, args)}`,
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
