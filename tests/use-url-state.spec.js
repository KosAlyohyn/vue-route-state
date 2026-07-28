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
      enabled: '1',
      search: 'hello',
    })
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

    await state.clear(['search', 'page'])
    expect(router.currentRoute.value.query).toEqual({
      enabled: '1',
      external: 'value',
      order: 'oldest',
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

    await state.reset(['order'])
    expect(router.currentRoute.value.query).toEqual({
      enabled: '1',
      external: 'value',
      order: 'newest',
      page: '2',
      search: 'hello',
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
      enabled: '1',
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
