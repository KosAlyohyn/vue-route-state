import { useRoute, useRouter } from 'vue-router'

export function useRouterContext() {
  return assertRouterContext(useRoute(), useRouter())
}

export function resolveRouterContext(options = {}) {
  const hasRoute = Object.prototype.hasOwnProperty.call(options, 'route')
  const hasRouter = Object.prototype.hasOwnProperty.call(options, 'router')

  if (hasRoute || hasRouter) {
    if (!hasRoute || !hasRouter) {
      throw new Error(
        'vue-route-state: requires both route and router when using explicit router context. Pass both options together or rely on Vue Router injection.',
      )
    }

    return assertRouterContext(options.route, options.router)
  }

  return useRouterContext()
}

function assertRouterContext(route, router) {
  if (!route || !router) {
    throw new Error(
      'vue-route-state: requires Vue Router. Install Vue Router, call URL state composables after app.use(router), and make sure the app resolves a single vue-router instance.',
    )
  }

  return {
    route,
    router,
  }
}
