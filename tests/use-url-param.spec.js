import { describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'

import { useUrlParam } from '../src/index.js'

import { createHarness, flushRouter } from './test-utils.js'

describe('useUrlParam', () => {
  it('reads, writes, and deletes a string parameter', async () => {
    const { router, run } = await createHarness('/?search=hello')
    const search = run(() =>
      useUrlParam('search', { type: 'string', defaultValue: '' }),
    )

    expect(search.value).toBe('hello')

    search.value = 'example'
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({ search: 'example' })

    search.value = null
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({})
    expect(search.value).toBe('')
  })

  it('omits default values by default and can write them explicitly', async () => {
    const first = await createHarness('/?page=2')
    const omitted = first.run(() =>
      useUrlParam('page', { type: 'number', defaultValue: 1 }),
    )

    omitted.value = 1
    await flushRouter()
    expect(first.router.currentRoute.value.query).toEqual({})

    const second = await createHarness('/')
    const explicit = second.run(() =>
      useUrlParam('page', {
        type: 'number',
        defaultValue: 1,
        omitDefault: false,
      }),
    )

    explicit.value = 1
    await flushRouter()
    expect(second.router.currentRoute.value.query).toEqual({ page: '1' })
  })

  it('preserves unmanaged query params', async () => {
    const { router, run } = await createHarness('/?external=value&page=2')
    const page = run(() =>
      useUrlParam('page', { type: 'number', defaultValue: 1 }),
    )

    page.value = 3
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
      page: '3',
    })
  })

  it('skips no-op navigation', async () => {
    const { router, run } = await createHarness('/?page=2')
    const page = run(() =>
      useUrlParam('page', { type: 'number', defaultValue: 1 }),
    )
    const replace = vi.spyOn(router, 'replace')

    page.value = 2
    await flushRouter()

    expect(replace).not.toHaveBeenCalled()
  })

  it('supports explicit router context', async () => {
    const { router } = await createHarness('/?page=2')
    const page = useUrlParam('page', {
      type: 'number',
      defaultValue: 1,
      route: router.currentRoute.value,
      router,
    })

    expect(page.value).toBe(2)

    page.value = 3
    await flushRouter()

    expect(router.currentRoute.value.query).toEqual({ page: '3' })
  })

  it('requires both route and router for explicit router context', () => {
    expect(() =>
      useUrlParam('search', {
        type: 'string',
        defaultValue: '',
        route: {},
      }),
    ).toThrow(
      'vue-route-state requires both route and router when using explicit router context.',
    )
  })

  it('supports history push', async () => {
    const { router, run } = await createHarness('/?page=1')
    const page = run(() =>
      useUrlParam('page', {
        type: 'number',
        defaultValue: 1,
        history: 'push',
      }),
    )
    const push = vi.spyOn(router, 'push')

    page.value = 2
    await flushRouter()

    expect(push).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.query).toEqual({ page: '2' })
  })

  it('throws a clear error without Vue Router', () => {
    const app = createApp({})

    expect(() =>
      app.runWithContext(() =>
        useUrlParam('search', {
          type: 'string',
          defaultValue: '',
        }),
      ),
    ).toThrow('vue-route-state requires Vue Router')
  })
})
