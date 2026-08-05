import { expectAssignable, expectError, expectType } from 'tsd'
import type { ComputedRef, WritableComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'

import type { CustomUrlStateFieldOptions } from '../index.js'
import {
  useUrlParam,
  useUrlQueryParam,
  useUrlState,
} from '../index.js'

const stringParam = useUrlParam('search', {
  type: 'string',
  defaultValue: '',
})
expectType<WritableComputedRef<string>>(stringParam)

const numberParam = useUrlParam('page', {
  type: 'number',
  defaultValue: 1,
  positive: true,
  integer: true,
})
expectType<WritableComputedRef<number>>(numberParam)

const arrayParam = useUrlParam('tags', {
  type: 'array',
  defaultValue: [] as string[],
})
expectType<WritableComputedRef<string[]>>(arrayParam)

const customField: CustomUrlStateFieldOptions<{ key: string; order: string }> = {
  type: 'custom',
  defaultValue: { key: 'name', order: 'asc' },
  parse() {
    return { key: 'created_at', order: 'desc' }
  },
  serialize(value) {
    return value.key + ':' + value.order
  },
}
const customParam = useUrlParam('sort', customField)
expectType<WritableComputedRef<{ key: string; order: string }>>(customParam)

const queryParam = useUrlQueryParam('payload', {
  defaultValue: { compact: false },
  parse() {
    return { compact: true }
  },
  serialize(value) {
    return value.compact ? '1' : null
  },
})
expectType<WritableComputedRef<{ compact: boolean }>>(queryParam)

const state = useUrlState({
  search: {
    type: 'string',
    defaultValue: '',
  },
  page: {
    type: 'number',
    defaultValue: 1,
    integer: true,
  },
  tags: {
    type: 'array',
    defaultValue: [] as string[],
  },
  enabled: {
    type: 'boolean',
    defaultValue: false,
  },
  period: {
    type: 'date',
    defaultValue: null,
  },
  sort: customField,
})

expectType<WritableComputedRef<string>>(state.search)
expectType<WritableComputedRef<number>>(state.page)
expectType<WritableComputedRef<string[]>>(state.tags)
expectType<WritableComputedRef<boolean>>(state.enabled)
expectType<WritableComputedRef<string | Date | null>>(state.period)
expectType<WritableComputedRef<{ key: string; order: string }>>(state.sort)

expectType<{
  search: string
  page: number
  tags: string[]
  enabled: boolean
  period: string | Date | null
  sort: { key: string; order: string }
}>(state.snapshot())

expectAssignable<ComputedRef<{
  search: string
  page: number
  tags: string[]
  enabled: boolean
  period: string | Date | null
  sort: { key: string; order: string }
}>>(state.values)

state.patch({ search: 'router', page: 2 })
expectError(state.patch({ missing: true }))  // unknown schema key

state.reset('page')
state.reset(['search', 'page'])
state.reset()
expectError(state.reset('missing')) // unknown field name

state.clear('search')
state.clear(['tags', 'enabled'])
state.clear()
expectError(state.clear('missing')) // unknown field name

const route = {} as RouteLocationNormalizedLoaded
const router = {} as Router
useUrlState(
  {
    search: {
      type: 'string',
      defaultValue: '',
    },
  },
  { route, router },
)
useUrlParam('search', { type: 'string', defaultValue: '', route, router })
useUrlQueryParam('search', { defaultValue: '', route, router })
