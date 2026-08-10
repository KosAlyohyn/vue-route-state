# Contributing

Thanks for helping improve `vue-route-state`.

## Development Setup

Install dependencies:

```bash
npm install
```

Useful commands:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
npm run package:check
```

Docs and playground:

```bash
npm run docs:dev
npm run docs:build
```

## Pull Requests

- Keep changes focused and easy to review.
- Add or update tests for behavior changes.
- Update README, docs, migration notes, or changelog when public behavior changes.
- Keep the core API small. App-specific helpers belong outside the library unless they support a broad URL state use case.
- Use `history: 'push'` for push navigation. Do not add `replace: false` as an alias.

## API Stability

Until `1.0.0`, minor releases may refine the pre-1.0 API. After `1.0.0`, breaking changes are reserved for major versions.

## Release Checklist

Before publishing, run:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
npm run docs:build
npm run package:check
```

Update `CHANGELOG.md` before publishing so the released version already documents its changes.
