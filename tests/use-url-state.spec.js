import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { useUrlState } from '../src/index.js'

import { createHarness, flushRouter } from './test-utils.js'

function schema() {
  return {
    search: {
      type: 'string',
      defaultValue: '',
    },
    page: {
      type: 'number',
      defaultValue: 1,
      positive: true,
    },
    enabled: {
      type: 'boolean',
      defaultValue: false,
    },
    tags: {
      type: 'array',
      key: 'tags[]',
      aliases: ['tags'],
      defaultValue: [],
    },
    order: {
      type: 'string',
      defaultValue: 'newest',
      allowedValues: ['newest', 'oldest'],
    },
  }
}

describe('useUrlState', () => {
  it('exposes fields as refs with parsed values', async () => {
    const { run } = await createHarness(
      '/?search=hello&page=3&enabled=1&tags[]=one&tags[]=two&order=oldest',
    )
    const state = run(() => useUrlState(schema()))

    expect(state.search.value).toBe('hello')
    expect(state.page.value).toBe(3)
    expect(state.enabled.value).toBe(true)
    expect(state.tags.value).toEqual(['one', 'two'])
    expect(state.order.value).toBe('oldest')
  })

  it('falls back for invalid values', async () => {
    const { run } = await createHarness('/?page=-1&order=invalid')
    const state = run(() => useUrlState(schema()))

    expect(state.page.value).toBe(1)
    expect(state.order.value).toBe('newest')
  })

  it('transforms values after parsing and before serialization', async () => {
    const { router, run } = await createHarness('/?search=%20hello%20')
    const state = run(() =>
      useUrlState({
        search: {
          type: 'string',
          defaultValue: '',
          transform(value) {
            return String(value).trim()
          },
        },
      }),
    )

    expect(state.search.value).toBe('hello')

    state.search.value = '  world  '
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({ search: 'world' })

    state.search.value = '   '
    await flushRouter()
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('supports custom fields', async () => {
    const { router, run } = await createHarness('/?sort=status:desc')
    const state = run(() =>
      useUrlState({
        sort: {
          type: 'custom',
          defaultValue: { key: 'name', order: 'asc' },
          parse(raw, field) {
            const [key, order] = String(raw || '').split(':')

            return key && order ? { key, order } : field.defaultValue
          },
          serialize(value) {
            return value.key + ':' + value.order
          },
        },
      }),
    )

    expect(state.sort.value).toEqual({ key: 'status', order: 'desc' })

    state.sort.value = { key: 'created_at', order: 'asc' }
    await flushRouter()

    expect(router.currentRoute.value.query).toEqual({
      sort: 'created_at:asc',
    })
  })

  it('supports date fields', async () => {
    const { router, run } = await createHarness('/?period_start=2026-07-28')
    const state = run(() =>
      useUrlState({
        periodStart: {
          type: 'date',
          key: 'period_start',
          defaultValue: '2026-01-01',
        },
        periodEnd: {
          type: 'date',
          key: 'period_end',
          defaultValue: null,
        },
      }),
    )

    expect(state.periodStart.value).toBe('2026-07-28')

    state.periodStart.value = '2026-02-31'
    state.periodEnd.value = new Date('2026-07-29T12:00:00.000Z')
    await flushRouter()

    expect(router.currentRoute.value.query).toEqual({
      period_end: '2026-07-29',
    })
    expect(state.periodStart.value).toBe('2026-01-01')
  })

  it('patches several fields in one navigation and preserves other query params', async () => {
    const { router, run } = await createHarness('/?external=value&page=2')
    const state = run(() => useUrlState(schema()))
    const replace = vi.spyOn(router, 'replace')

    await state.patch({
      search: 'hello',
      page: 1,
      enabled: true,
    })

    expect(replace).toHaveBeenCalledTimes(1)
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
      enabled: 'true',
      search: 'hello',
    })
  })

  it('preserves named route params and hash during query navigation', async () => {
    const { router, run } = await createHarness(
      '/items/item-42?panel=summary#activity',
      [
        {
          path: '/items/:slug',
          name: 'item',
          component: {},
        },
      ],
    )
    const state = run(() => useUrlState(schema()))
    const replace = vi.spyOn(router, 'replace')

    await state.patch({ search: 'hello' })

    expect(replace).toHaveBeenCalledWith({
      name: 'item',
      params: {
        slug: 'item-42',
      },
      query: {
        panel: 'summary',
        search: 'hello',
      },
      hash: '#activity',
    })
    expect(router.currentRoute.value.fullPath).toBe(
      '/items/item-42?panel=summary&search=hello#activity',
    )
  })

  it('preserves path and hash for unnamed routes', async () => {
    const { router, run } = await createHarness(
      '/profiles/user-1?panel=details#overview',
      [
        {
          path: '/profiles/:id',
          component: {},
        },
      ],
    )
    const state = run(() => useUrlState(schema()))
    const replace = vi.spyOn(router, 'replace')

    await state.patch({ page: 2 })

    expect(replace).toHaveBeenCalledWith({
      path: '/profiles/user-1',
      query: {
        panel: 'details',
        page: '2',
      },
      hash: '#overview',
    })
    expect(router.currentRoute.value.fullPath).toBe(
      '/profiles/user-1?panel=details&page=2#overview',
    )
  })

  it('ignores undefined inside patch and deletes null values', async () => {
    const { router, run } = await createHarness('/?search=old&page=2&enabled=1')
    const state = run(() => useUrlState(schema()))

    await state.patch({
      search: undefined,
      page: null,
      enabled: false,
    })

    expect(router.currentRoute.value.query).toEqual({
      search: 'old',
    })
  })

  it('throws for unknown fields in patch', async () => {
    const { run } = await createHarness('/')
    const state = run(() => useUrlState(schema()))

    await expect(state.patch({ missing: 'value' })).rejects.toThrow(
      'Unknown URL state field: missing',
    )
  })

  it('clears selected fields and the whole schema', async () => {
    const { router, run } = await createHarness(
      '/?external=value&search=hello&page=2&enabled=1&order=oldest',
    )
    const state = run(() => useUrlState(schema()))

    await state.clear('search')
    expect(router.currentRoute.value.query).toEqual({
      enabled: 'true',
      external: 'value',
      order: 'oldest',
      page: '2',
    })

    await state.clear(['page', 'order'])
    expect(router.currentRoute.value.query).toEqual({
      enabled: 'true',
      external: 'value',
    })

    await state.clear()
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
    })
  })

  it('resets all or selected fields to defaults', async () => {
    const { router, run } = await createHarness(
      '/?external=value&search=hello&page=2&enabled=1&order=oldest',
    )
    const state = run(() =>
      useUrlState({
        ...schema(),
        order: {
          type: 'string',
          defaultValue: 'newest',
          allowedValues: ['newest', 'oldest'],
          omitDefault: false,
        },
      }),
    )

    await state.reset('order')
    expect(router.currentRoute.value.query).toEqual({
      enabled: 'true',
      external: 'value',
      order: 'newest',
      page: '2',
      search: 'hello',
    })

    await state.reset(['search', 'page'])
    expect(router.currentRoute.value.query).toEqual({
      enabled: 'true',
      external: 'value',
      order: 'newest',
    })

    await state.reset()
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
      order: 'newest',
    })
  })

  it('returns detached snapshot objects and reactive values', async () => {
    const { router, run } = await createHarness(
      '/?search=hello&page=2&tags[]=one',
    )
    const state = run(() => useUrlState(schema()))

    expect(state.snapshot()).toEqual({
      search: 'hello',
      page: 2,
      enabled: false,
      tags: ['one'],
      order: 'newest',
    })
    expect(state.values.value).toEqual(state.snapshot())

    const values = state.snapshot()
    values.tags.push('mutated')
    expect(state.tags.value).toEqual(['one'])

    await router.replace('/?search=next&page=3')
    expect(state.values.value.search).toBe('next')
  })

  it('reports whether a field is explicitly present in the query', async () => {
    const { router, run } = await createHarness(
      '/?page=invalid&tags=active&enabled',
    )
    const state = run(() => useUrlState(schema()))

    expect(state.page.value).toBe(1)
    expect(state.hasQueryValue('page')).toBe(true)
    expect(state.hasQueryValue('tags')).toBe(true)
    expect(state.hasQueryValue('enabled')).toBe(true)
    expect(state.hasQueryValue('search')).toBe(false)

    await router.replace('/?search=&page=1')

    expect(state.hasQueryValue('search')).toBe(true)
    expect(state.hasQueryValue('page')).toBe(true)
    expect(state.hasQueryValue('tags')).toBe(false)
    expect(() => state.hasQueryValue('missing')).toThrow(
      'Unknown URL state field: missing',
    )
  })

  it('resolves and removes conditionally enabled fields in configured order', async () => {
    const { router, run } = await createHarness(
      '/?mode=advanced&detail=visible&external=value',
    )
    const state = run(() =>
      useUrlState(
        {
          detail: {
            type: 'string',
            defaultValue: '',
            enabledWhen: ({ values }) => values.mode === 'advanced',
          },
          mode: {
            type: 'string',
            defaultValue: 'simple',
            allowedValues: ['simple', 'advanced'],
          },
        },
        {
          order: ['mode', 'detail'],
        },
      ),
    )

    expect(state.mode.value).toBe('advanced')
    expect(state.detail.value).toBe('visible')

    await state.patch({ mode: 'simple' })

    expect(state.detail.value).toBe('')
    expect(state.hasQueryValue('detail')).toBe(false)
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
    })

    await state.patch({
      mode: 'advanced',
      detail: 'next',
    })

    expect(router.currentRoute.value.query).toEqual({
      detail: 'next',
      external: 'value',
      mode: 'advanced',
    })

    await router.replace('/?mode=simple&detail=stale')

    expect(state.detail.value).toBe('')
    expect(state.hasQueryValue('detail')).toBe(true)
  })

  it('supports conditionally enabled field groups', async () => {
    const { router, run } = await createHarness(
      '/?view=details&detail_type=summary&page=2&external=value',
    )
    const state = run(() =>
      useUrlState(
        {
          view: {
            type: 'string',
            defaultValue: null,
          },
          detailType: {
            type: 'string',
            key: 'detail_type',
            defaultValue: 'all',
          },
          page: {
            type: 'number',
            defaultValue: 1,
            positive: true,
          },
        },
        {
          order: ['view', 'detailType', 'page'],
          groups: {
            details: {
              fields: ['detailType', 'page'],
              enabledWhen: ({ values }) => values.view === 'details',
            },
          },
        },
      ),
    )

    expect(state.detailType.value).toBe('summary')
    expect(state.page.value).toBe(2)

    await state.patch({ view: null })

    expect(state.detailType.value).toBe('all')
    expect(state.page.value).toBe(1)
    expect(state.hasQueryValue('detailType')).toBe(false)
    expect(router.currentRoute.value.query).toEqual({
      external: 'value',
    })

    await router.replace('/?detail_type=stale&page=3')

    expect(state.detailType.value).toBe('all')
    expect(state.page.value).toBe(1)
    expect(state.hasQueryValue('detailType')).toBe(true)

    await state.patch({
      view: 'details',
      detailType: 'activity',
      page: 4,
    })

    expect(router.currentRoute.value.query).toEqual({
      view: 'details',
      detail_type: 'activity',
      page: '4',
    })
  })

  it('throws for unknown fields in groups', async () => {
    const { run } = await createHarness('/')

    expect(() =>
      run(() =>
        useUrlState(
          {
            view: {
              type: 'string',
              defaultValue: null,
            },
          },
          {
            groups: {
              viewGroup: {
                fields: ['missing'],
              },
            },
          },
        ),
      ),
    ).toThrow('Unknown URL state group field: missing')
  })

  it('supports explicit router context', async () => {
    const { router } = await createHarness('/?page=2')
    const state = useUrlState(schema(), {
      route: router.currentRoute.value,
      router,
    })

    expect(state.page.value).toBe(2)

    await state.patch({ page: 3 })

    expect(router.currentRoute.value.query).toEqual({ page: '3' })
  })

  it('requires both route and router for explicit router context', () => {
    expect(() =>
      useUrlState(schema(), {
        route: {},
      }),
    ).toThrow(
      'vue-route-state requires both route and router when using explicit router context.',
    )
  })

  it('reacts to browser back and forward navigation', async () => {
    const { router, run } = await createHarness('/?page=1')
    const state = run(() => useUrlState(schema(), { history: 'push' }))

    await state.patch({ page: 2 })
    await state.patch({ page: 3 })

    expect(state.page.value).toBe(3)

    router.back()
    await flushRouter()
    await nextTick()
    expect(state.page.value).toBe(2)

    router.forward()
    await flushRouter()
    await nextTick()
    expect(state.page.value).toBe(3)
  })

  it('overrides history for an individual action', async () => {
    const { router, run } = await createHarness('/?page=1')
    const state = run(() => useUrlState(schema()))
    const push = vi.spyOn(router, 'push')
    const replace = vi.spyOn(router, 'replace')

    await state.patch({ page: 2 }, { history: 'push' })

    expect(push).toHaveBeenCalledTimes(1)
    expect(replace).not.toHaveBeenCalled()
    expect(router.currentRoute.value.query).toEqual({ page: '2' })
  })

  it('can replace for an individual action when push is the default', async () => {
    const { router, run } = await createHarness('/?page=1')
    const state = run(() => useUrlState(schema(), { history: 'push' }))
    const push = vi.spyOn(router, 'push')
    const replace = vi.spyOn(router, 'replace')

    await state.clear(['page'], { history: 'replace' })

    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
    expect(router.currentRoute.value.query).toEqual({})
  })

  it('rejects unsupported history for an individual action', async () => {
    const { run } = await createHarness('/')
    const state = run(() => useUrlState(schema()))

    await expect(state.reset(['page'], { history: 'invalid' })).rejects.toThrow(
      'Unsupported history mode: invalid',
    )
  })

  it('uses replace history by default', async () => {
    const { router, run } = await createHarness('/?page=1')
    const state = run(() => useUrlState(schema()))
    const replace = vi.spyOn(router, 'replace')

    state.page.value = 2
    await flushRouter()

    expect(replace).toHaveBeenCalledTimes(1)
  })

  it('preserves synchronous field assignments made before router navigation settles', async () => {
    const { router, run } = await createHarness('/?external=value')
    const state = run(() => useUrlState(schema()))

    state.search.value = 'hello'
    state.page.value = 2
    state.enabled.value = true

    await flushRouter()

    expect(router.currentRoute.value.query).toEqual({
      enabled: 'true',
      external: 'value',
      page: '2',
      search: 'hello',
    })
  })

  it('throws for unknown field types during setup', async () => {
    const { run } = await createHarness('/')

    expect(() =>
      run(() =>
        useUrlState({
          broken: {
            type: 'object',
            defaultValue: {},
          },
        }),
      ),
    ).toThrow('Unsupported URL state type: object')
  })
})
