# Migration Guide

This guide covers the common steps for moving existing Vue Router query helpers to vue-route-state.

## Migrating to 1.0.0

The public API is stable as of `1.0.0`. Breaking changes are reserved for major versions.

- Use `history: 'push'` when a write should add a browser history entry. The older `replace: false` wrapper option is not part of the stable API.
- Custom schema fields use `type: 'custom'` with `parse(raw, field)`, `serialize(value, field)`, and optional `transform(value, field)`.
- Router injection uses `{ route, router }` for `useUrlState`, `useUrlParam`, and `useUrlQueryParam`. Use a reactive route source such as `useRoute()` or `router.currentRoute`, not a one-time `router.currentRoute.value` snapshot.
- Single-field resets use `state.reset('fieldName')` and `state.clear('fieldName')`.

## Replace Manual Query Reads

Before:

```js
const search = computed(() => route.query.search || '')
```

After:

```js
const state = useUrlState({
  search: {
    type: 'string',
    defaultValue: '',
  },
})

state.search.value
```

## Replace Manual Query Writes

Before:

```js
router.replace({
  query: {
    ...route.query,
    search: value || undefined,
  },
})
```

After:

```js
state.search.value = value

await state.patch({
  search: value,
  page: 1,
})
```

## Preserve Legacy URLs

Use `aliases` when existing links already use another query key. Aliases are read-only fallback keys; writes always use the primary key.

```js
const state = useUrlState({
  search: {
    type: 'string',
    key: 'search',
    aliases: ['q'],
    defaultValue: '',
  },
})
```

This reads `?q=router` and writes `?search=router`.

## Move Custom Wrappers Gradually

Use `useUrlParam` for one built-in field and `useUrlQueryParam` for low-level custom parse/serialize wrappers.

```js
const page = useUrlParam('page', {
  type: 'number',
  defaultValue: 1,
  positive: true,
  integer: true,
})

const sort = useUrlQueryParam('sort', {
  defaultValue: { key: 'name', order: 'asc' },
  parse(value, defaultValue) {},
  serialize(value, defaultValue) {},
})
```

## Prefer Current History API

Use `history: 'replace' | 'push'`. The older `replace: false` wrapper option is intentionally not part of the `1.0` API.

```js
const state = useUrlState(schema, {
  history: 'push',
})
```

## Router Injection

Pass both `route` and `router` when building wrappers, tests, or integration layers that already own the router context. The route source must stay reactive; use `useRoute()` inside components or `router.currentRoute` in tests and wrappers.

```js
const state = useUrlState(schema, {
  route: router.currentRoute,
  router,
})
```

## Compatibility Policy

The public API is stable as of `1.0.0`. Breaking changes are reserved for major versions. Compatibility aliases are kept only when they do not duplicate stable core options.
