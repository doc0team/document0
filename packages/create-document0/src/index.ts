#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import kleur from "kleur";
import prompts from "prompts";

type Framework = "nextjs" | "vue";

const FRAMEWORKS: { value: Framework; title: string; description: string }[] = [
  { value: "nextjs", title: "Next.js", description: "React + Next.js" },
  { value: "vue", title: "Vue", description: "Vue + Vite" },
];

function templateDir(framework: Framework): string {
  return path.join(
    path.dirname(new URL(import.meta.url).pathname),
    `../template-${framework}`
  );
}

const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo", "dist"]);

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function detectPackageManager(): "npm" | "pnpm" | "yarn" | "bun" {
  const agent = process.env["npm_config_user_agent"] ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";
  return "npm";
}

function installCommand(pm: string): string {
  return pm === "yarn" ? "yarn" : `${pm} install`;
}

function devCommand(pm: string): string {
  return pm === "npm" ? "npm run dev" : `${pm} dev`;
}

const onCancel = () => {
  console.log(kleur.red("\n  Cancelled.\n"));
  process.exit(1);
};

async function main(): Promise<void> {
  console.log();
  console.log(kleur.bold().cyan("  document0"));
  console.log(kleur.dim("  Headless documentation framework\n"));

  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts(
      {
        type: "text",
        name: "projectName",
        message: "Project name:",
        initial: "my-docs",
        validate: (v: string) =>
          v.trim().length > 0 ? true : "Project name is required",
      },
      { onCancel }
    );
    projectName = (response as { projectName: string }).projectName;
  }

  projectName = projectName.trim();
  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    const { overwrite } = await prompts(
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory "${projectName}" is not empty. Continue?`,
        initial: false,
      },
      { onCancel }
    );
    if (!overwrite) {
      console.log(kleur.red("\n  Cancelled.\n"));
      process.exit(1);
    }
  }

  const { framework } = (await prompts(
    {
      type: "select",
      name: "framework",
      message: "Framework:",
      choices: FRAMEWORKS,
      initial: 0,
    },
    { onCancel }
  )) as { framework: Framework };

  const pm = detectPackageManager();

  const { install } = await prompts(
    {
      type: "confirm",
      name: "install",
      message: `Install dependencies with ${kleur.cyan(pm)}?`,
      initial: true,
    },
    { onCancel }
  );

  console.log();
  console.log(kleur.dim(`  Scaffolding into ${kleur.reset(targetDir)} ...`));

  copyDir(templateDir(framework), targetDir);

  const pkgPath = path.join(targetDir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
  pkg["name"] = projectName;
  const { dependencies, devDependencies } = pkg as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  if (dependencies) {
    for (const key of Object.keys(dependencies)) {
      if (dependencies[key]?.startsWith("workspace:")) {
        delete dependencies[key];
      }
    }
  }
  if (devDependencies) {
    for (const key of Object.keys(devDependencies)) {
      if (devDependencies[key]?.startsWith("workspace:")) {
        delete devDependencies[key];
      }
    }
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  if (install) {
    console.log(kleur.dim(`\n  Installing dependencies...\n`));
    try {
      execSync(installCommand(pm), { cwd: targetDir, stdio: "inherit" });
    } catch {
      console.log(kleur.yellow("\n  Dependency install failed. Run it manually.\n"));
    }
  }

  const devUrl =
    framework === "nextjs"
      ? "http://localhost:3000/docs"
      : "http://localhost:5173";

  console.log();
  console.log(kleur.bold().green("  Done! ✓"));
  console.log();
  console.log("  Next steps:\n");

  if (projectName !== ".") {
    console.log(kleur.cyan(`    cd ${projectName}`));
  }
  if (!install) {
    console.log(kleur.cyan(`    ${installCommand(pm)}`));
  }
  console.log(kleur.cyan(`    ${devCommand(pm)}`));
  console.log();
  console.log(kleur.dim(`  Open ${devUrl} to see your site.`));
  console.log();
}

main().catch((err: unknown) => {
  console.error(kleur.red("\n  Error:"), err);
  process.exit(1);
});
