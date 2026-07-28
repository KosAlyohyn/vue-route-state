import { queryEquals } from '../helpers/equality.js'
import { cloneQuery, deleteFieldKeys } from '../helpers/query.js'
import { orderFields } from '../helpers/schema.js'

import { serializeFieldValue } from './create-field.js'
import { cloneValue, isFieldEnabled, resolveValues } from './resolve-values.js'

export function createQueryUpdater(route, router, fields, options = {}) {
  const defaultHistory = normalizeHistory(options.history ?? 'replace')
  const orderedFields = orderFields(fields, options.order)
  let pendingQuery = null
  let pendingNavigation = null

  return async function updateQuery(values, actionOptions = {}) {
    const history = normalizeHistory(actionOptions.history ?? defaultHistory)
    const baseQuery = pendingQuery ?? route.query
    const nextValues = resolveValues(route, fields, orderedFields, baseQuery)

    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) {
        continue
      }

      const field = fields[name]

      if (!field) {
        throw new Error(`Unknown URL state field: ${name}`)
      }

      nextValues[name] = cloneValue(value)
    }

    const query = buildQuery(
      route,
      fields,
      orderedFields,
      nextValues,
      baseQuery,
    )

    if (queryEquals(baseQuery, query)) {
      return pendingNavigation ?? undefined
    }

    pendingQuery = query

    const navigation = router[history]({
      query,
    })
    const trackedNavigation = Promise.resolve(navigation).finally(() => {
      if (pendingNavigation === trackedNavigation) {
        pendingQuery = null
        pendingNavigation = null
      }
    })

    pendingNavigation = trackedNavigation

    return trackedNavigation
  }
}

function buildQuery(route, fields, orderedFields, values, sourceQuery) {
  const query = cloneQuery(sourceQuery)

  for (const field of Object.values(fields)) {
    deleteFieldKeys(query, field)
  }

  for (const name of orderedFields) {
    const field = fields[name]
    const context = {
      field: name,
      values,
      query: sourceQuery,
      route,
    }

    if (!isFieldEnabled(field, context)) {
      values[name] = cloneValue(field.defaultValue)
      continue
    }

    const serialized = serializeFieldValue(field, values[name])

    if (serialized != null) {
      query[field.key] = serialized
    }
  }

  return query
}

function normalizeHistory(history) {
  if (history !== 'replace' && history !== 'push') {
    throw new Error(`Unsupported history mode: ${history}`)
  }

  return history
}
