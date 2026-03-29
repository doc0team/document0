import kleur from "kleur";
import {
  fetchRegistryIndex,
  searchItems,
} from "../registry.js";

export async function search(query: string): Promise<void> {
  if (!query) {
    console.log(kleur.red("  No search query provided."));
    console.log(kleur.dim("  Usage: document0 search <query>"));
    process.exit(1);
  }

  console.log();
  console.log(kleur.dim("  Searching registry..."));

  const index = await fetchRegistryIndex();
  const results = searchItems(index, query);

  if (results.length === 0) {
    console.log(kleur.yellow(`\n  No items found for "${query}".`));
    console.log(
      kleur.dim(
        `  Available: ${index.items.map((i) => `${i.namespace}/${i.name}`).join(", ")}`,
      ),
    );
    console.log();
    return;
  }

  console.log();
  console.log(
    kleur.bold(`  ${results.length} result${results.length > 1 ? "s" : ""}`) +
      kleur.dim(` for "${query}"\n`),
  );

  const maxId = Math.max(...results.map((i) => `${i.namespace}/${i.name}`.length));

  for (const item of results) {
    const id = `${item.namespace}/${item.name}`;
    const name = kleur.cyan(id.padEnd(maxId + 2));
    const version = kleur.dim(`v${item.version}`);
    const tags = kleur.dim(`[${item.tags.join(", ")}]`);
    console.log(`  ${name} ${version}  ${item.description}`);
    console.log(`  ${"".padEnd(maxId + 2)} ${tags}`);
  }

  console.log();
  console.log(kleur.dim("  Install: document0 add <namespace/name>"));
  console.log();
}
