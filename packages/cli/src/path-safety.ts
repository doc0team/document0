import path from "node:path";

function normalizeRelative(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Resolve a registry-provided install path and ensure it stays inside the
 * current project root.
 */
export function resolveSafeInstallDir(installPath: string): string {
  const projectRoot = path.resolve(process.cwd());
  const targetDir = path.resolve(projectRoot, installPath);
  const relativeToRoot = path.relative(projectRoot, targetDir);

  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot) ||
    normalizeRelative(relativeToRoot) === ""
  ) {
    throw new Error(
      `Unsafe installPath "${installPath}". Resolved path must stay inside the current project.`,
    );
  }

  return targetDir;
}

/**
 * Resolve a registry file path and ensure it stays inside the install dir.
 */
export function resolveSafeTargetFile(targetDir: string, file: string): string {
  const targetPath = path.resolve(targetDir, file);
  const relativeToInstallDir = path.relative(targetDir, targetPath);

  if (
    relativeToInstallDir.startsWith("..") ||
    path.isAbsolute(relativeToInstallDir)
  ) {
    throw new Error(
      `Unsafe file path "${file}". File must stay inside installPath.`,
    );
  }

  return targetPath;
}
