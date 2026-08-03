import { computed } from 'vue'

import { queryEquals } from '../helpers/equality.js'
import { cloneQuery } from '../helpers/query.js'
import { useRouterContext } from '../helpers/router.js'

export function useUrlQueryParam(key, options = {}) {
  const {
    defaultValue = null,
    parse = parseDefault,
    serialize = serializeDefault,
  } = options
  const { route, router } = useRouterContext()
  const history = normalizeHistory(options)

  return computed({
    get() {
      return parse(route.query[key], defaultValue)
    },
    set(value) {
      const serialized = serialize(value, defaultValue)
      const query = cloneQuery(route.query)

      if (
        serialized === undefined ||
        serialized === null ||
        serialized === ''
      ) {
        delete query[key]
      } else {
        query[key] = serialized
      }

      if (queryEquals(route.query, query)) {
        return
      }

      router[history](createNavigationTarget(route, query))
    },
  })
}

function parseDefault(value, defaultValue) {
  return value ?? defaultValue
}

function serializeDefault(value) {
  return value
}

function normalizeHistory(options) {
  const history =
    options.history ?? (options.replace === false ? 'push' : 'replace')

  if (history !== 'replace' && history !== 'push') {
    throw new Error(`Unsupported history mode: ${history}`)
  }

  return history
}

function createNavigationTarget(route, query) {
  const target = {
    query,
    hash: route.hash,
  }

  if (route.name != null) {
    target.name = route.name
    target.params = cloneRouteParams(route.params)
  } else {
    target.path = route.path
  }

  return target
}

function cloneRouteParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([name, value]) => [
      name,
      Array.isArray(value) ? [...value] : value,
    ]),
  )
}
