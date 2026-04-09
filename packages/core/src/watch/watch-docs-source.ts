import path from "node:path";
import type { DocsSource } from "../source/index.js";
import type {
  DocsSourceWatchEvent,
  DocsSourceWatchOptions,
  DocsSourceWatcher,
} from "../types.js";

const watchers = new WeakMap<DocsSource, DocsSourceWatcher>();

export async function stopWatchingDocsSource(source: DocsSource): Promise<void> {
  const h = watchers.get(source);
  if (!h) return;
  watchers.delete(source);
  await h.close();
}

/**
 * Watch the docs root for changes and debounce-call {@link DocsSource.invalidate}.
 * Published on **`@document0/core/watch`** so **chokidar** is not loaded from the main
 * `@document0/core` graph (avoids bundlers trying to resolve `node:fs/promises` for unrelated imports).
 */
export async function watchDocsSource(
  source: DocsSource,
  options: DocsSourceWatchOptions = {},
): Promise<DocsSourceWatcher> {
  await stopWatchingDocsSource(source);

  const { default: chokidar } = await import("chokidar");

  const rootDir = source.getContentRoot();
  const extensions = source.getContentExtensions();
  const debounceMs = options.debounceMs ?? 150;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const normalizePath = (raw: string): string =>
    path.isAbsolute(raw) ? path.normalize(raw) : path.normalize(path.join(rootDir, raw));

  const isTrackedFile = (fp: string): boolean => {
    if (path.basename(fp) === "_meta.json") return true;
    return extensions.includes(path.extname(fp));
  };

  const flush = (): void => {
    debounceTimer = null;
    source.invalidate();
    options.onInvalidate?.();
  };

  const scheduleFlush = (): void => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flush, debounceMs);
  };

  const watcher = chokidar.watch(rootDir, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 100, pollInterval: 50 },
    ignored: (p: string) => {
      const n = normalizePath(p);
      if (n.includes(`${path.sep}node_modules${path.sep}`)) return true;
      if (n.split(path.sep).includes(".git")) return true;
      return options.ignored?.(n) ?? false;
    },
  });

  watcher.on("all", (event, rawPath) => {
    if (!rawPath || event === "error") return;
    if (
      event !== "add" &&
      event !== "change" &&
      event !== "unlink" &&
      event !== "addDir" &&
      event !== "unlinkDir"
    ) {
      return;
    }

    const absPath = normalizePath(rawPath);
    const ev: DocsSourceWatchEvent = { kind: event, path: absPath };
    options.onEvent?.(ev);

    if (event === "addDir" || event === "unlinkDir") {
      scheduleFlush();
      return;
    }
    if (isTrackedFile(absPath)) scheduleFlush();
  });

  const handle: DocsSourceWatcher = {
    close: async () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      await watcher.close();
    },
  };

  watchers.set(source, handle);
  return handle;
}
