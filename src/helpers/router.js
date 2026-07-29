import { useRoute, useRouter } from 'vue-router'

export function useRouterContext() {
  const route = useRoute()
  const router = useRouter()

  if (!route || !router) {
    throw new Error(
      'vue-route-state requires Vue Router. Install Vue Router before calling URL state composables.',
    )
  }

  return {
    route,
    router,
  }
}
