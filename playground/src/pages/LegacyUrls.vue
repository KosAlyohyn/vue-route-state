<script setup>
import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'
import { useRoute, useRouter } from 'vue-router'

import DemoInspector from '../components/DemoInspector.vue'

const route = useRoute()
const router = useRouter()

const schema = {
  search: {
    type: 'string',
    aliases: ['q'],
    defaultValue: '',
  },
  hideDuplicates: {
    type: 'boolean',
    key: 'hide_duplicates',
    aliases: ['dedupe'],
    defaultValue: false,
  },
  tags: {
    type: 'array',
    key: 'tags[]',
    aliases: ['tags'],
    defaultValue: [],
  },
}

const state = useUrlState(schema)

const availableTags = ['docs', 'debug', 'router', 'query']

const items = [
  {
    id: 1,
    title: 'Router docs',
    tags: ['docs', 'router'],
    duplicate: false,
  },
  {
    id: 2,
    title: 'Router docs',
    tags: ['docs'],
    duplicate: true,
  },
  {
    id: 3,
    title: 'Debug query guide',
    tags: ['debug', 'query'],
    duplicate: false,
  },
  {
    id: 4,
    title: 'Release notes',
    tags: ['docs'],
    duplicate: false,
  },
]

const results = computed(() => {
  const search = state.search.value.trim().toLowerCase()
  const tags = state.tags.value
  const hideDuplicates = state.hideDuplicates.value

  return items.filter((item) => {
    const matchesSearch = !search || item.title.toLowerCase().includes(search)
    const matchesTags =
      !tags.length || tags.some((tag) => item.tags.includes(tag))
    const matchesDuplicates = !hideDuplicates || !item.duplicate

    return matchesSearch && matchesTags && matchesDuplicates
  })
})

const hasManagedQuery = computed(() => {
  return (
    Object.prototype.hasOwnProperty.call(route.query, 'search') ||
    Object.prototype.hasOwnProperty.call(route.query, 'q') ||
    Object.prototype.hasOwnProperty.call(route.query, 'hide_duplicates') ||
    Object.prototype.hasOwnProperty.call(route.query, 'dedupe') ||
    Object.prototype.hasOwnProperty.call(route.query, 'tags[]') ||
    Object.prototype.hasOwnProperty.call(route.query, 'tags')
  )
})

const normalizedTags = computed(() => {
  return [...new Set([...availableTags, ...state.tags.value])].sort()
})

function toggleTag(tag) {
  const selectedTags = state.tags.value

  state.tags.value = selectedTags.includes(tag)
    ? selectedTags.filter((item) => item !== tag)
    : [...selectedTags, tag]
}

function loadLegacySearch() {
  router.replace({
    query: {
      q: 'router',
    },
  })
}

function loadLegacyBoolean() {
  router.replace({
    query: {
      dedupe: '1',
    },
  })
}

function loadLegacyTags() {
  router.replace({
    query: {
      tags: ['docs', 'debug'],
    },
  })
}

function loadCombinedLegacyUrl() {
  router.replace({
    query: {
      q: 'router',
      dedupe: '1',
      tags: ['docs', 'debug'],
    },
  })
}

function normalizeUrl() {
  state.patch({
    search: state.search.value,
    hideDuplicates: state.hideDuplicates.value,
    tags: state.tags.value,
  })
}

function resetState() {
  state.reset()
}

function clearState() {
  state.clear()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Legacy URLs</h2>
      <p>
        Read old query keys, keep the state, then rewrite the URL with current
        keys.
      </p>
    </header>

    <section class="panel">
      <h3>Load legacy URL</h3>
      <p class="actions">
        <button type="button" @click="loadLegacySearch">Load q=router</button>
        <button type="button" @click="loadLegacyBoolean">Load dedupe=1</button>
        <button type="button" @click="loadLegacyTags">
          Load tags=docs&tags=debug
        </button>
        <button type="button" @click="loadCombinedLegacyUrl">
          Load combined legacy URL
        </button>
      </p>
    </section>

    <section class="panel">
      <h3>Current state</h3>

      <label>
        Search
        <input v-model="state.search.value" placeholder="Search by title" />
      </label>

      <label class="checkbox">
        <input v-model="state.hideDuplicates.value" type="checkbox" />
        Hide duplicates
      </label>

      <label>
        Tags
        <div>
          <div class="tag-list">
            <label v-for="tag in normalizedTags" :key="tag">
              <input
                :checked="state.tags.value.includes(tag)"
                type="checkbox"
                @change="toggleTag(tag)"
              />
              {{ tag }}
            </label>
          </div>
        </div>
      </label>
    </section>

    <section class="panel">
      <h3>URL actions</h3>
      <p class="actions">
        <button
          type="button"
          :disabled="!hasManagedQuery"
          @click="normalizeUrl"
        >
          Normalize URL
        </button>
        <button type="button" :disabled="!hasManagedQuery" @click="resetState">
          Reset filters
        </button>
        <button type="button" :disabled="!hasManagedQuery" @click="clearState">
          Clear URL params
        </button>
      </p>
    </section>

    <section class="panel">
      <h3>Matching items</h3>
      <ul class="result-list">
        <li v-for="item in results" :key="item.id">
          <span>{{ item.title }}</span>
          <span>{{ item.tags.join(', ') }}</span>
        </li>
      </ul>
    </section>

    <DemoInspector :schema="schema" :parsed-state="state.values.value" />
  </section>
</template>
