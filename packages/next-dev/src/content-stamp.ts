/**
 * In **development** (webpack server compile), this module is transformed so it
 * depends on your docs directory; any change there invalidates importers (e.g. your
 * `DocsSource` module)
 *
 * Import once from the same file where you construct **`DocsSource`**:
 *
 * ```ts
 * import "@document0/next-dev/content-stamp";
 * ```
 */
export const document0ContentStamp = 0;
