import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'

export function useFilters() {
  const state = useUrlState({
    search: {
      type: 'string',
      defaultValue: '',
    },
    page: {
      type: 'number',
      defaultValue: 1,
      positive: true,
    },
    limit: {
      type: 'number',
      defaultValue: 20,
      positive: true,
    },
    sort: {
      type: 'string',
      defaultValue: 'newest',
      allowedValues: ['newest', 'oldest', 'name'],
    },
    tags: {
      type: 'array',
      key: 'tags[]',
      aliases: ['tags'],
      defaultValue: [],
    },
    enabled: {
      type: 'boolean',
      defaultValue: false,
    },
  })

  const requestParams = computed(() => ({
    search: state.search.value,
    page: state.page.value,
    limit: state.limit.value,
    sort: state.sort.value,
    tags: state.tags.value,
    enabled: state.enabled.value,
  }))

  return {
    state,
    requestParams,
  }
}
