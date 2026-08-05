# Changelog

All notable changes to this project are documented in this file.

## Unreleased

- Added a public docs and playground app for GitHub Pages.
- Added demo scenarios for search, pagination, filters, legacy URLs, and custom codecs.
- Added GitHub Pages deployment workflow for the playground build.
- Added docs scripts for local development, build, and preview.

## 0.6.1

- Added single-key ergonomics for `state.reset(name)` and `state.clear(name)`.
- Finalized the core extension contract around custom fields, transforms, and router injection.

## 0.6.0

- Added custom schema fields with `type: 'custom'`.
- Added `parse(raw, field)` and `serialize(value, field)` support for custom fields.
- Added `transform(value, field)` support for schema fields.
- Added explicit router injection for `useUrlState`, `useUrlParam`, and `useUrlQueryParam`.
