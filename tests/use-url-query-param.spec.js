import { describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'

import { useUrlQueryParam } from '../src/index.js'

import { createHarness, flushRouter } from './test-utils.js'

describe('useUrlQueryParam', () => {
  it('reads, writes, and deletes a custom parsed parameter', async () => {
    const { router, run } = await createHarness('/?page=2')
    const page = run(() =>
      useUrlQueryParam('page', {
        defaultValue: 1,
        parse(value, defaultValue) {
          const parsed = Number(Array.isArray(value) ? value[0] : value)
          return Number.isFinite(parsed) ? parsed : defaultValue
        },
        serialize(value) {
          return value > 1 ? String(value) : null
        },
      }),
    )

    expect(page.value).toBe(2)

    page.value = 3
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({ page: '3' })

    page.value = 1
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({})
    expect(page.value).toBe(1)
  })

  it('preserves unmanaged query params and route target details', async () => {
    const routes = [
      {
        path: '/items/:id',
        name: 'item',
        component: {},
      },
    ]
    const { router, run } = await createHarness(
      '/items/42?external=value#details',
      routes,
    )
    const filter = run(() =>
      useUrlQueryParam('filter', {
        defaultValue: '',
        parse(value, defaultValue) {
          return value == null ? defaultValue : String(value)
        },
      }),
    )

    filter.value = 'active'
    await flushRouter()

    expect(router.currentRoute.value.name).toBe('item')
    expect(router.currentRoute.value.params).toEqual({ id: '42' })
    expect(router.currentRoute.value.hash).toBe('#details')
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
      filter: 'active',
    })
  })

  it('supports explicit router context', async () => {
    const { router } = await createHarness('/?page=2')
    const page = useUrlQueryParam('page', {
      defaultValue: 1,
      route: router.currentRoute.value,
      router,
      parse(value, defaultValue) {
        const parsed = Number(Array.isArray(value) ? value[0] : value)
        return Number.isFinite(parsed) ? parsed : defaultValue
      },
      serialize(value) {
        return String(value)
      },
    })

    expect(page.value).toBe(2)

    page.value = 3
    await flushRouter()

    expect(router.currentRoute.value.query).toEqual({ page: '3' })
  })

  it('requires both route and router for explicit router context', () => {
    expect(() =>
      useUrlQueryParam('search', {
        defaultValue: '',
        route: {},
      }),
    ).toThrow(
      'vue-route-state requires both route and router when using explicit router context.',
    )
  })

  it('supports replace false as a push shortcut', async () => {
    const { router, run } = await createHarness('/')
    const search = run(() =>
      useUrlQueryParam('search', {
        defaultValue: '',
        replace: false,
      }),
    )
    const push = vi.spyOn(router, 'push')

    search.value = 'hello'
    await flushRouter()

    expect(push).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.query).toEqual({ search: 'hello' })
  })

  it('supports history push', async () => {
    const { router, run } = await createHarness('/')
    const search = run(() =>
      useUrlQueryParam('search', {
        defaultValue: '',
        history: 'push',
      }),
    )
    const push = vi.spyOn(router, 'push')

    search.value = 'hello'
    await flushRouter()

    expect(push).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.query).toEqual({ search: 'hello' })
  })

  it('skips no-op navigation', async () => {
    const { router, run } = await createHarness('/?search=hello')
    const search = run(() => useUrlQueryParam('search'))
    const replace = vi.spyOn(router, 'replace')

    search.value = 'hello'
    await flushRouter()

    expect(replace).not.toHaveBeenCalled()
  })

  it('throws a clear error without Vue Router', () => {
    const app = createApp({})

    expect(() =>
      app.runWithContext(() => useUrlQueryParam('search')),
    ).toThrow('vue-route-state requires Vue Router')
  })
})
