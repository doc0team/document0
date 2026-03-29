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
