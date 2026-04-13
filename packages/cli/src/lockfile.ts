import fs from "node:fs";
import path from "node:path";

const LOCK_FILE_NAME = "document0.lock.json";

export interface LockFileEntry {
  namespace: string;
  name: string;
  version: string;
  installPath: string;
  installedAt: string;
}

export interface LockFile {
  version: 1;
  items: Record<string, LockFileEntry>;
}

function getLockFilePath(): string {
  return path.resolve(process.cwd(), LOCK_FILE_NAME);
}

export function readLockFile(): LockFile {
  const filePath = getLockFilePath();
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as LockFile;
    } catch {
      return { version: 1, items: {} };
    }
  }
  return { version: 1, items: {} };
}

export function writeLockFile(lock: LockFile): void {
  const filePath = getLockFilePath();
  fs.writeFileSync(filePath, JSON.stringify(lock, null, 2) + "\n", "utf-8");
}

export function recordInstall(
  namespace: string,
  name: string,
  version: string,
  installPath: string,
): void {
  const lock = readLockFile();
  const key = `${namespace}/${name}`;
  lock.items[key] = {
    namespace,
    name,
    version,
    installPath,
    installedAt: new Date().toISOString(),
  };
  writeLockFile(lock);
}
