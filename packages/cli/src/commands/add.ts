import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import kleur from "kleur";
import {
  fetchRegistryIndex,
  fetchPluginFile,
  findPlugin,
} from "../registry.js";

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
    console.log(kleur.red("  No plugin names provided."));
    console.log(kleur.dim("  Usage: document0 add <plugin> [plugin2 ...]"));
    process.exit(1);
  }

  console.log();
  console.log(kleur.dim("  Fetching registry..."));

  const index = await fetchRegistryIndex();
  const allDeps: Record<string, string> = {};

  for (const name of names) {
    const plugin = findPlugin(index, name);
    if (!plugin) {
      console.log(kleur.red(`  Plugin "${name}" not found in registry.`));
      console.log(
        kleur.dim(
          `  Available: ${index.plugins.map((p) => p.name).join(", ")}`,
        ),
      );
      process.exit(1);
    }

    console.log(
      kleur.cyan(`  Installing ${kleur.bold(plugin.name)}`) +
        kleur.dim(` v${plugin.version}`),
    );

    const targetDir = path.resolve(process.cwd(), plugin.installPath);
    fs.mkdirSync(targetDir, { recursive: true });

    for (const file of plugin.files) {
      const content = await fetchPluginFile(plugin.name, file);
      const targetPath = path.join(targetDir, file);
      fs.writeFileSync(targetPath, content, "utf-8");
      console.log(kleur.dim(`    → ${plugin.installPath}/${file}`));
    }

    Object.assign(allDeps, plugin.dependencies);
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

  console.log();
  console.log(kleur.bold().green("  Done! ✓"));
  console.log();
  console.log(kleur.dim("  Usage:"));
  for (const name of names) {
    const plugin = findPlugin(index, name)!;
    console.log(
      kleur.cyan(`    import { ... } from "./${plugin.installPath}";`),
    );
  }
  console.log();
}
