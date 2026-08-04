import { computed } from 'vue'

import {
  createField,
  hasFieldQueryValue,
  serializeFieldValue,
} from '../core/create-field.js'
import { normalizeGroups } from '../core/groups.js'
import { resolveValues } from '../core/resolve-values.js'
import { createQueryUpdater } from '../core/update-query.js'
import { cloneQuery, deleteFieldKeys } from '../helpers/query.js'
import { resolveRouterContext } from '../helpers/router.js'
import {
  assertKnownFields,
  normalizeSchema,
  orderFields,
} from '../helpers/schema.js'

export function useUrlState(schema, options = {}) {
  const { route, router } = resolveRouterContext(options)
  const fields = normalizeSchema(schema)
  const orderedFields = orderFields(fields, options.order)
  const groups = normalizeGroups(fields, options.groups)
  const updateQuery = createQueryUpdater(route, router, fields, options)
  const state = {}

  for (const [name, field] of Object.entries(fields)) {
    state[name] = createField(
      route,
      updateQuery,
      field,
      () =>
        resolveValues(route, fields, orderedFields, route.query, groups)[name],
    )
  }

  state.patch = async (values, actionOptions) => {
    assertKnownFields(fields, values)
    return updateQuery(values, actionOptions)
  }

  state.clear = async (names, actionOptions) => {
    const selected = normalizeFieldNames(names, fields)
    assertKnownFields(
      fields,
      Object.fromEntries(selected.map((name) => [name, null])),
    )

    return updateQuery(
      Object.fromEntries(selected.map((name) => [name, null])),
      actionOptions,
    )
  }

  state.reset = async (names, actionOptions) => {
    const selected = normalizeFieldNames(names, fields)
    assertKnownFields(
      fields,
      Object.fromEntries(selected.map((name) => [name, null])),
    )

    return updateQuery(
      Object.fromEntries(
        selected.map((name) => [name, fields[name].defaultValue]),
      ),
      actionOptions,
    )
  }

  state.hasQueryValue = (name) => {
    assertKnownFields(fields, { [name]: null })
    return hasFieldQueryValue(route, fields[name])
  }

  state.snapshot = () => snapshot(route, fields, orderedFields, groups)

  state.values = computed(() => snapshot(route, fields, orderedFields, groups))

  return state
}

function snapshot(route, fields, orderedFields, groups) {
  return resolveValues(route, fields, orderedFields, route.query, groups)
}

function normalizeFieldNames(names, fields) {
  if (names == null) {
    return Object.keys(fields)
  }

  return Array.isArray(names) ? names : [names]
}

export function serializeManagedDefaults(route, fields) {
  const query = cloneQuery(route.query)

  for (const field of Object.values(fields)) {
    deleteFieldKeys(query, field)
    const serialized = serializeFieldValue(field, field.defaultValue)

    if (serialized != null) {
      query[field.key] = serialized
    }
  }

  return query
}
