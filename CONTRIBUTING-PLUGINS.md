# Contributing a Plugin

Thank you for building a plugin for document0! This guide walks you through
submitting it to the community registry.

## Structure

Every plugin lives in `registry/plugins/<name>/` and contains:

```
registry/plugins/my-plugin/
  registry.json   # metadata
  index.ts        # source code (self-contained)
```

## registry.json

```json
{
  "name": "my-plugin",
  "description": "Short, clear description of what it does.",
  "author": "your-github-username",
  "version": "0.1.0",
  "tags": ["relevant", "search", "tags"],
  "category": "mdx or core",
  "files": ["index.ts"],
  "dependencies": {},
  "registryDependencies": [],
  "installPath": "plugins/my-plugin"
}
```

| Field                 | Required | Description                                              |
| --------------------- | -------- | -------------------------------------------------------- |
| `name`                | yes      | Unique plugin name (kebab-case)                          |
| `description`         | yes      | One-line summary                                         |
| `author`              | yes      | Your GitHub username                                     |
| `version`             | yes      | Semver version                                           |
| `tags`                | yes      | Search keywords                                          |
| `category`            | yes      | `"mdx"` (remark/rehype) or `"core"` (data layer)        |
| `files`               | yes      | Source files to install (relative to plugin dir)          |
| `dependencies`        | no       | npm packages the plugin needs (auto-installed by CLI)    |
| `registryDependencies`| no       | Other registry plugins this one depends on               |
| `installPath`         | yes      | Where files are copied in the user's project             |

## Plugin source (index.ts)

Your plugin should export a factory function that returns an object matching
the `Document0Plugin` shape:

```ts
export function myPlugin(options?: MyPluginOptions) {
  return {
    name: "my-plugin",

    // Remark plugins to inject into the MDX pipeline
    remarkPlugins: [],

    // Rehype plugins to inject into the MDX pipeline
    rehypePlugins: [],

    // Transform pages after loading from the file system
    transformPages(pages) { return pages; },

    // Transform the page tree after building
    transformTree(tree) { return tree; },

    // Transform the processed MDX result
    transformResult(result, context) { return result; },
  };
}
```

All hooks are optional. Only include what your plugin needs.

Keep the source **self-contained**: avoid importing from `@document0/core`
or `@document0/mdx` internals. The user owns the code after install.

## Submitting

1. Fork this repo
2. Create `registry/plugins/<your-plugin>/` with `registry.json` and source files
3. Add your plugin entry to `registry/registry-index.json`
4. Open a pull request with:
   - **Title:** `plugin: <name>`
   - **Description:** What it does, usage example, any trade-offs

We review submissions for quality, security, and fit. Typical turnaround
is a few days.

## Testing locally

```bash
# Point the CLI at your local registry
export DOCUMENT0_REGISTRY=file://$(pwd)/registry
npx @document0/cli add my-plugin
```
