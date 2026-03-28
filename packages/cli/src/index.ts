#!/usr/bin/env node
import kleur from "kleur";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";
import { search } from "./commands/search.js";

const HELP = `
  ${kleur.bold().cyan("document0")} — plugin manager for document0

  ${kleur.bold("Commands:")}
    add <plugin> [...]   Install plugins from the registry
    list                 List all available plugins
    search <query>       Search plugins by name, tag, or description

  ${kleur.bold("Options:")}
    --help, -h           Show this help message

  ${kleur.bold("Environment:")}
    DOCUMENT0_REGISTRY   Override registry base URL

  ${kleur.bold("Examples:")}
    document0 add admonitions
    document0 add reading-time content-graph
    document0 list
    document0 search callout
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(HELP);
    return;
  }

  switch (command) {
    case "add":
      await add(args.slice(1));
      break;
    case "list":
    case "ls":
      await list();
      break;
    case "search":
      await search(args.slice(1).join(" "));
      break;
    default:
      console.log(kleur.red(`\n  Unknown command: ${command}`));
      console.log(HELP);
      process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(kleur.red("\n  Error:"), err);
  process.exit(1);
});
