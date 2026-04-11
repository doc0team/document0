import fs from "node:fs/promises";
import path from "node:path";
import type { MetaFile } from "./types.js";

/**
 * Read and parse `_meta.json` from a directory.
 * Returns `null` if the file does not exist or cannot be parsed.
 */
export async function readMeta(dir: string): Promise<MetaFile | null> {
  const full = path.join(dir, "_meta.json");
  try {
    const raw = await fs.readFile(full, "utf-8");
    return JSON.parse(raw) as MetaFile;
  } catch {
    return null;
  }
}
