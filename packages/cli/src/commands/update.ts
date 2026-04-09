import fs from "node:fs";
import kleur from "kleur";
import {
  fetchRegistryIndex,
  fetchItemFile,
  findItem,
} from "../registry.js";
import { readLockFile, recordInstall } from "../lockfile.js";
import { resolveSafeInstallDir, resolveSafeTargetFile } from "../path-safety.js";

export async function update(names: string[]): Promise<void> {
  const lock = readLockFile();
  const installed = Object.keys(lock.items);

  if (installed.length === 0) {
    console.log(
      kleur.yellow("\n  No installed components found in document0.lock.json."),
    );
    console.log(kleur.dim("  Run `document0 add <name>` to install components first.\n"));
    return;
  }

  const targets = names.length > 0 ? names : installed;

  console.log();
  console.log(kleur.dim("  Fetching registry..."));

  const index = await fetchRegistryIndex();
  let updatedCount = 0;

  for (const target of targets) {
    const entry = lock.items[target];
    if (!entry) {
      console.log(kleur.yellow(`  "${target}" is not installed. Skipping.`));
      continue;
    }

    const fullId = `${entry.namespace}/${entry.name}`;
    const item = findItem(index, fullId);
    if (!item) {
      console.log(kleur.yellow(`  "${fullId}" no longer exists in registry. Skipping.`));
      continue;
    }

    if (item.version === entry.version) {
      console.log(kleur.dim(`  ${fullId} is already up to date (v${item.version})`));
      continue;
    }

    console.log(
      kleur.cyan(`  Updating ${kleur.bold(fullId)}`) +
        kleur.dim(` v${entry.version} → v${item.version}`),
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
    }

    recordInstall(item.namespace, item.name, item.version, item.installPath);
    updatedCount++;
  }

  console.log();
  if (updatedCount === 0) {
    console.log(kleur.bold().green("  Everything is up to date!"));
  } else {
    console.log(kleur.bold().green(`  Updated ${updatedCount} component${updatedCount > 1 ? "s" : ""}!`));
  }
  console.log();
}
