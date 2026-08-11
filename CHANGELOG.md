# Changelog

All notable changes to this project are documented in this file.

## Unreleased

## 1.1.0 - 2026-08-11

### Changed

- Added Vue Router 5 support. Vue Router 5 is now the primary tested version; Vue Router 4 remains accepted by the peer range because the library only uses stable router APIs.

## 1.0.1 - 2026-08-11

### Fixed

- Prevented string and number fields from serializing values outside `allowedValues`.
- Rejected schema field names that conflict with returned URL state helper names.
- Deep-cloned arrays, plain objects, and dates in URL state snapshots.
- Kept explicit router context reactive when using `router.currentRoute`.

### Changed

- Added formatting checks to CI and the npm publish guard.
- Clarified runtime Node compatibility separately from repository tooling requirements.

## 1.0.0 - 2026-08-10

### Added

- Added security and contributing documentation.
- Added TypeScript type tests for public API inference.
- Added a public docs and playground app for GitHub Pages.
- Added demo scenarios for search, pagination, filters, legacy URLs, and custom codecs.
- Added GitHub Pages deployment workflow for the playground build.
- Added docs scripts for local development, build, and preview.
- Added a migration guide.
- Added package validation with `npm pack --dry-run`, `publint`, and `attw --pack` for release checks and npm publish guard.

### Changed

- Renamed the playground URL copy action to `Copy demo link` and fixed copied links for the GitHub Pages hash router.
- Kept `replace: false` out of the stable API; use `history: 'push'` instead.
- Standardized runtime error messages with the `vue-route-state:` prefix.
- Clarified compatibility policy and migration wording around history mode.
- Cleaned test naming so examples stay application-neutral.
- Updated the library build global name to `VueRouteState`.
- Improved Vue Router context error messages.

### Fixed

- Fixed changelog repository links after the package rename.
- Synced the playground lockfile package name with `vue-route-state-playground`.

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

[Unreleased]: https://github.com/KosAlyohyn/vue-route-state/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/KosAlyohyn/vue-route-state/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/KosAlyohyn/vue-route-state/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/KosAlyohyn/vue-route-state/compare/v0.6.1...v1.0.0
[0.6.1]: https://github.com/KosAlyohyn/vue-route-state/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/KosAlyohyn/vue-route-state/releases/tag/v0.6.0
