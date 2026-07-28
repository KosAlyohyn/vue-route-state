import { computed } from 'vue'

import {
  createField,
  readField,
  serializeFieldValue,
} from '../core/create-field.js'
import { createQueryUpdater } from '../core/update-query.js'
import { cloneQuery, deleteFieldKeys } from '../helpers/query.js'
import { useRouterContext } from '../helpers/router.js'
import { assertKnownFields, normalizeSchema } from '../helpers/schema.js'

export function useUrlState(schema, options = {}) {
  const { route, router } = useRouterContext()
  const fields = normalizeSchema(schema)
  const updateQuery = createQueryUpdater(route, router, fields, options)
  const state = {}

  for (const [name, field] of Object.entries(fields)) {
    state[name] = createField(route, updateQuery, field)
  }

  state.patch = async (values, actionOptions) => {
    assertKnownFields(fields, values)
    return updateQuery(values, actionOptions)
  }

  state.clear = async (names, actionOptions) => {
    const selected = names ?? Object.keys(fields)
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
    const selected = names ?? Object.keys(fields)
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

  state.snapshot = () => snapshot(route, fields)

  state.values = computed(() => snapshot(route, fields))

  return state
}

function snapshot(route, fields) {
  const values = {}

  for (const [name, field] of Object.entries(fields)) {
    const value = readField(route, field)
    values[name] = Array.isArray(value) ? [...value] : value
  }

  return values
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
