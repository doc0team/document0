import kleur from "kleur";
import { fetchRegistryIndex } from "../registry.js";

export async function list(): Promise<void> {
  console.log();
  console.log(kleur.dim("  Fetching registry..."));

  const index = await fetchRegistryIndex();

  console.log();
  console.log(
    kleur.bold(`  ${index.items.length} items available`) +
      kleur.dim("  (document0 registry)\n"),
  );

  const maxId = Math.max(...index.items.map((i) => `${i.namespace}/${i.name}`.length));

  for (const item of index.items) {
    const id = `${item.namespace}/${item.name}`;
    const name = kleur.cyan(id.padEnd(maxId + 2));
    const version = kleur.dim(`v${item.version}`);
    const category = kleur.yellow(item.category.padEnd(5));
    console.log(`  ${name} ${category} ${version}  ${item.description}`);
  }

  console.log();
  console.log(kleur.dim("  Install: document0 add <namespace/name>"));
  console.log();
}
