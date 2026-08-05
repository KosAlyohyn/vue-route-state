# Changelog

All notable changes to this project are documented in this file.

## Unreleased

## 0.7.0 - 2026-08-05

### Added

- Added a public docs and playground app for GitHub Pages.
- Added demo scenarios for search, pagination, filters, legacy URLs, and custom codecs.
- Added GitHub Pages deployment workflow for the playground build.
- Added docs scripts for local development, build, and preview.

## 0.6.1 - 2026-08-04

### Added

- Added single-key ergonomics for `state.reset(name)` and `state.clear(name)`.
- Finalized the core extension contract around custom fields, transforms, and router injection.

## 0.6.0 - 2026-08-03

### Added

- Added custom schema fields with `type: 'custom'`.
- Added `parse(raw, field)` and `serialize(value, field)` support for custom fields.
- Added `transform(value, field)` support for schema fields.
- Added explicit router injection for `useUrlState`, `useUrlParam`, and `useUrlQueryParam`.

[Unreleased]: https://github.com/KosAlyohyn/vue-url-state/compare/v0.7.0...HEAD
[0.7.0]: https://github.com/KosAlyohyn/vue-url-state/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/KosAlyohyn/vue-url-state/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/KosAlyohyn/vue-url-state/releases/tag/v0.6.0
