import { createApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

export async function createHarness(
  path = '/',
  routes = [
    {
      path: '/',
      component: {},
    },
  ],
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })
  const app = createApp({})

  app.use(router)
  await router.push(path)
  await router.isReady()

  return {
    app,
    router,
    run(callback) {
      return app.runWithContext(callback)
    },
  }
}

export async function flushRouter() {
  await Promise.resolve()
  await new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
  await nextTick()
}
