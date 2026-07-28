import { queryEquals } from '../helpers/equality.js'
import { cloneQuery, deleteFieldKeys } from '../helpers/query.js'

import { serializeFieldValue } from './create-field.js'

export function createQueryUpdater(route, router, fields, options = {}) {
  const defaultHistory = normalizeHistory(options.history ?? 'replace')
  let pendingQuery = null
  let pendingNavigation = null

  return async function updateQuery(values, actionOptions = {}) {
    const history = normalizeHistory(actionOptions.history ?? defaultHistory)
    const baseQuery = pendingQuery ?? route.query
    const query = cloneQuery(baseQuery)

    for (const [name, value] of Object.entries(values)) {
      if (value === undefined) {
        continue
      }

      const field = fields[name]

      if (!field) {
        throw new Error(`Unknown URL state field: ${name}`)
      }

      deleteFieldKeys(query, field)

      const serialized = serializeFieldValue(field, value)

      if (serialized != null) {
        query[field.key] = serialized
      }
    }

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

function normalizeHistory(history) {
  if (history !== 'replace' && history !== 'push') {
    throw new Error(`Unsupported history mode: ${history}`)
  }

  return history
}
