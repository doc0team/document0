import kleur from "kleur";
import {
  fetchRegistryIndex,
  searchPlugins,
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
  const results = searchPlugins(index, query);

  if (results.length === 0) {
    console.log(kleur.yellow(`\n  No plugins found for "${query}".`));
    console.log(
      kleur.dim(
        `  Available: ${index.plugins.map((p) => p.name).join(", ")}`,
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

  const maxName = Math.max(...results.map((p) => p.name.length));

  for (const plugin of results) {
    const name = kleur.cyan(plugin.name.padEnd(maxName + 2));
    const version = kleur.dim(`v${plugin.version}`);
    const tags = kleur.dim(`[${plugin.tags.join(", ")}]`);
    console.log(`  ${name} ${version}  ${plugin.description}`);
    console.log(`  ${"".padEnd(maxName + 2)} ${tags}`);
  }

  console.log();
  console.log(kleur.dim("  Install: document0 add <name>"));
  console.log();
}
