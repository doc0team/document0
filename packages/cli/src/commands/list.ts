import kleur from "kleur";
import { fetchRegistryIndex } from "../registry.js";

export async function list(): Promise<void> {
  console.log();
  console.log(kleur.dim("  Fetching registry..."));

  const index = await fetchRegistryIndex();

  console.log();
  console.log(
    kleur.bold(`  ${index.plugins.length} plugins available`) +
      kleur.dim("  (document0 registry)\n"),
  );

  const maxName = Math.max(...index.plugins.map((p) => p.name.length));

  for (const plugin of index.plugins) {
    const name = kleur.cyan(plugin.name.padEnd(maxName + 2));
    const version = kleur.dim(`v${plugin.version}`);
    const category = kleur.yellow(plugin.category.padEnd(5));
    console.log(`  ${name} ${category} ${version}  ${plugin.description}`);
  }

  console.log();
  console.log(kleur.dim("  Install: document0 add <name>"));
  console.log();
}
