# vue-route-state

`vue-route-state` is a small Vue 3 library for storing reactive state in Vue Router query parameters.

The API is intentionally close to `useState`, but the URL is the source of truth. Values are read from `route.query`, and writes use `router.replace()` by default, so browser reload, manual URL edits, back, and forward navigation update the returned refs automatically.

## Install

```bash
npm install vue-route-state
```

Peer dependencies:

```bash
npm install vue vue-router
```

## Public API

```js
export { useUrlParam, useUrlQueryParam, useUrlState }
```

## useUrlParam

```js
import { useUrlParam } from 'vue-route-state'

const search = useUrlParam('search', {
  type: 'string',
  defaultValue: '',
})

search.value = 'example'
```

The URL becomes:

```txt
?search=example
```

Deleting a value removes the query parameter:

```js
search.value = null
```

## useUrlQueryParam

Use `useUrlQueryParam` when a parameter needs custom parsing or serialization instead of a built-in codec:

```js
import { useUrlQueryParam } from 'vue-route-state'

const payload = useUrlQueryParam('payload', {
  defaultValue: {},
  parse(value, defaultValue) {
    if (!value) {
      return defaultValue
    }

    try {
      return JSON.parse(String(Array.isArray(value) ? value[0] : value))
    } catch {
      return defaultValue
    }
  },
  serialize(value, defaultValue) {
    return value === defaultValue ? null : JSON.stringify(value)
  },
})
```

The parser receives the raw Vue Router query value and `defaultValue`. The serializer receives the next value and `defaultValue`. Returning `undefined`, `null`, or an empty string removes the query parameter.

Writes use `router.replace()` by default. Pass `history: 'push'` or `replace: false` to use `router.push()`.

## useUrlState

```js
import { useUrlState } from 'vue-route-state'

const state = useUrlState({
  search: {
    type: 'string',
    defaultValue: '',
  },
  page: {
    type: 'number',
    defaultValue: 1,
    positive: true,
    integer: true,
  },
  enabled: {
    type: 'boolean',
    defaultValue: false,
  },
  periodStart: {
    type: 'date',
    key: 'period_start',
    defaultValue: null,
  },
  tags: {
    type: 'array',
    key: 'tags[]',
    aliases: ['tags'],
    defaultValue: [],
  },
  order: {
    type: 'string',
    defaultValue: 'newest',
    allowedValues: ['newest', 'oldest'],
  },
})

state.search.value = 'hello'
state.page.value = 3
```

Each schema field is returned as a writable computed ref.

## Schema

Supported field options:

```js
{
  type,
  key,
  aliases,
  defaultValue,
  allowedValues,
  positive,
  integer,
  omitDefault,
  enabledWhen,
}
```

`key` defaults to the schema field name. `omitDefault` defaults to `true`, so assigning the default value removes the parameter from the URL. Set `omitDefault: false` to write default values explicitly.

## Conditional fields

`enabledWhen` and the `order` option apply to `useUrlState()`.

Use `enabledWhen` for fields that only apply when other URL state has a
particular value:

```js
const state = useUrlState(
  {
    mode: {
      type: 'string',
      defaultValue: 'simple',
      allowedValues: ['simple', 'advanced'],
    },
    detail: {
      type: 'string',
      defaultValue: '',
      enabledWhen: ({ values }) => values.mode === 'advanced',
    },
  },
  {
    order: ['mode', 'detail'],
  },
)
```

The predicate receives:

```js
{
  field, // current schema field name
  values, // values for the current read or update
  query, // query being read or updated
  route, // current Vue Router route
}
```

Fields listed in `order` are resolved first. Remaining fields follow their
schema declaration order. This makes dependencies deterministic even when a
dependent field is declared before the field it reads. Fields placed before the
current field are guaranteed to be normalized before its predicate runs.

When `enabledWhen` returns `false`, the field reads as its `defaultValue`.
During the next state write, its primary key and aliases are removed from the
URL. `patch()` can enable a field and assign its value in the same call.

## Field groups

Use `groups` when several fields share the same availability rule:

```js
const state = useUrlState(
  {
    view: {
      type: 'string',
      defaultValue: 'list',
      allowedValues: ['list', 'details'],
    },
    detailTab: {
      type: 'string',
      key: 'detail_tab',
      defaultValue: 'summary',
    },
    detailPage: {
      type: 'number',
      key: 'detail_page',
      defaultValue: 1,
      positive: true,
      integer: true,
    },
  },
  {
    order: ['view', 'detailTab', 'detailPage'],
    groups: {
      details: {
        fields: ['detailTab', 'detailPage'],
        enabledWhen: ({ values }) => values.view === 'details',
      },
    },
  },
)
```

When a group is disabled, its fields read as their `defaultValue`. During the
next state write, their primary keys and aliases are removed from the URL by
default. Set `clearWhenDisabled: false` to preserve disabled group query keys
while still reading default values.

Group predicates receive the same context as field predicates plus `group`,
the group name.

## Types

`string` reads the first query value when Vue Router provides an array. Missing values return `defaultValue`.

`number` supports finite JavaScript numbers using `Number(value)`. Invalid values such as `abc`, `NaN`, and values less than or equal to zero with `positive: true` return `defaultValue`. Set `integer: true` to reject fractional values such as `2.5`. `0` is valid unless `positive: true` is set.

`boolean` reads `true`, `false`, `1`, and `0`. It writes canonical values as `true` and `false` by default. Set `trueValue` and `falseValue` on a boolean field to write custom canonical values, such as `1` and `0`. `false` is a valid value.

`date` supports `YYYY-MM-DD` strings and valid `Date` objects. Invalid dates such as `today`, `2026-99-99`, and `2026-02-31` return `defaultValue`. Dates are written as `YYYY-MM-DD`.

`array` supports arrays of strings. It reads repeated query parameters and comma-separated fallback values, such as `?tags[]=one&tags[]=two` and `?tags=one,two`. Empty arrays remove the query parameter. Objects in arrays are not supported. With `allowedValues`, arrays filter invalid items by default. Set `invalidValues: 'default'` to return `defaultValue` when any item is unsupported.

## patch

Use `patch()` for related changes. It performs one router navigation and preserves unmanaged query parameters.

```js
await state.patch({
  search: 'hello',
  page: 1,
  enabled: true,
})
```

`patch()` updates only provided fields. `undefined` means “do not change this field”. `null` removes the field from the URL. Unknown fields throw `Unknown URL state field: name`.

The second argument can override the history mode for one action:

```js
await state.patch(
  {
    search: 'hello',
    page: 1,
  },
  {
    history: 'push',
  },
)
```

Sequential assignments are supported, but they can create separate router navigations:

```js
state.search.value = 'hello'
state.page.value = 2
```

For connected updates, prefer `patch()`.

## clear

```js
await state.clear(['search', 'page'])
```

This removes only the selected managed parameters. Without arguments, it removes all parameters managed by the schema:

```js
await state.clear()
```

Unmanaged query parameters are preserved.

## reset

```js
await state.reset()
await state.reset(['page', 'order'])
```

`reset()` assigns `defaultValue` for selected fields. Normal serialization rules still apply, including `omitDefault`.

## snapshot and values

```js
const values = state.snapshot()
```

`snapshot()` returns a detached plain object. Mutating it does not change URL state.

```js
state.values.value
```

`values` is a computed ref containing current parsed values for the whole schema.

## hasQueryValue

Use `hasQueryValue()` when the application needs to distinguish an absent
parameter from an explicitly provided value:

```js
state.page.value // 1 for both URLs

// /items
state.hasQueryValue('page') // false

// /items?page=1
state.hasQueryValue('page') // true
```

The method checks both the primary `key` and its `aliases`. It reports whether
the query key is present, independently of parsing: an invalid value such as
`?page=invalid` is present even when `state.page.value` falls back to its
`defaultValue`.

## aliases

Aliases are read-only fallback keys.

```js
tags: {
  type: 'array',
  key: 'tags[]',
  aliases: ['tags'],
  defaultValue: [],
}
```

Rules:

1. The primary `key` has priority.
2. Aliases are checked only when the primary key is absent.
3. Writes always use the primary key.
4. Writes remove stale alias keys.

## allowedValues

```js
order: {
  type: 'string',
  defaultValue: 'newest',
  allowedValues: ['newest', 'oldest'],
}
```

For scalar types, if the URL contains an unsupported value, reading returns `defaultValue`.

For arrays, invalid values are filtered by default because each item is independent:

```js
tags: {
  type: 'array',
  defaultValue: [],
  allowedValues: ['a', 'b', 'c'],
  invalidValues: 'filter',
}
```

Use `invalidValues: 'default'` to make an array return `defaultValue` when any item is unsupported.

## History

Writes use `router.replace()` by default.

```js
useUrlState(schema, {
  history: 'replace',
})
```

Use `history: 'push'` to create browser history entries:

```js
useUrlParam('page', {
  type: 'number',
  defaultValue: 1,
  history: 'push',
})
```

No-op updates do not call `router.replace()` or `router.push()`.

Query writes preserve the current route target. Named routes keep their `name`,
`params`, and `hash`; unnamed routes keep their resolved `path` and `hash`.

`patch()`, `clear()`, and `reset()` can override the configured mode for one
navigation:

```js
await state.clear(['search'], {
  history: 'push',
})

await state.reset(['page'], {
  history: 'replace',
})
```

## Universal Example

```js
import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'

const state = useUrlState({
  search: {
    type: 'string',
    defaultValue: '',
  },
  page: {
    type: 'number',
    defaultValue: 1,
    positive: true,
  },
  limit: {
    type: 'number',
    defaultValue: 20,
    positive: true,
  },
  sort: {
    type: 'string',
    defaultValue: 'newest',
    allowedValues: ['newest', 'oldest', 'name'],
  },
  tags: {
    type: 'array',
    key: 'tags[]',
    aliases: ['tags'],
    defaultValue: [],
  },
  enabled: {
    type: 'boolean',
    defaultValue: false,
  },
})

await state.patch({
  search: 'example',
  page: 1,
  sort: 'name',
})

const requestParams = computed(() => ({
  search: state.search.value,
  page: state.page.value,
  limit: state.limit.value,
  sort: state.sort.value,
  tags: state.tags.value,
  enabled: state.enabled.value,
}))
```

Building API requests remains the application's responsibility.

## Architecture

The library is split into small modules:

- `codecs/` parse and serialize supported field types.
- `core/create-field.js` creates writable computed refs and reads current values.
- `core/update-query.js` rebuilds managed query state, preserves unmanaged keys, and performs no-op detection.
- `helpers/` contains schema normalization, query helpers, equality checks, and Vue Router context validation.
- `composables/` exposes `useUrlParam` and `useUrlState`.

## Development

The repository uses a single root `eslint.config.js` for library source, tests, examples, and playground files.

ESLint checks:

- no `console.log`;
- no unused variables;
- import order, duplicate imports, and imports before executable code;
- Vue recommended rules for `.vue` files.

Prettier handles formatting through the root `.prettierrc`.

The repository also contains a full demo project in `playground/`:

- `playground/src/pages/SearchFilters.vue` covers strings, booleans, `reset`, and `clear`.

The playground imports the local library source through a Vite alias, so it reflects changes in `src/` immediately.

## Commands

```bash
npm install
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run build
npm run playground:dev
npm run playground:build
```
