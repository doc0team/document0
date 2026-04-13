/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

/**
 * In development, webpack re-runs this loader when anything under `contentDir`
 * changes (`addContextDependency`). The fresh module export invalidates every
 * importer — same idea as Fumadocs regenerating `.source` with new import hashes.
 */
module.exports = function document0ContentStampLoader() {
  const opts = this.getOptions ? this.getOptions() : {};
  const dir = opts.contentDir;
  if (typeof dir !== "string" || dir.length === 0) {
    throw new Error(
      "@document0/next-dev: content-stamp-loader requires options.contentDir",
    );
  }

  this.cacheable(false);
  this.addContextDependency(dir);

  const stamp = Date.now();
  return `export const document0ContentStamp = ${stamp};\n`;
};
