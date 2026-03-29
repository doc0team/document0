# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [0.3.0] - 2026-03-29

### Removed

- **`buildSearchIndex`** and **`searchPages`** — Legacy sync search API removed from `@document0/core`. Use `createSearchRoute` instead.
- **`SearchIndex`** type removed from `@document0/core`. Use `SearchResult` instead.

### Changed

- **`buildOpenAPISearchIndex`** now returns `SearchResult[]` instead of the removed `SearchIndex[]`.
- **`createSearchRoute`** (Orama-backed, async, with fuzzy matching and relevance ranking) is now the single canonical search API.
- Documentation and registry references updated to point at `createSearchRoute`.
- Added `_cache = new Map<string, unknown>()` to `DocsSource` - a generic instance-scoped cache that any module can use. `invalidate()` now also calls `this._cache.clear()`. Removed module-level cachedDb and cachedSourceRef singletons. `getOrCreateDb()` now reads/writes via `source._cache` using a `_searchDb` key. Each `DocsSource` instance gets its own isolated Orama DB, and it's automatically cleared on `invalidate()`. This fixes the singleton anti-pattern. Multiple `DocsSource` instances now each maintain their own search index, and hot-reload works correctly via `invalidate()`.
