<script setup>
import { computed, ref } from 'vue'
import { useUrlState } from 'vue-route-state'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const customTag = ref('')

const state = useUrlState({
  tags: {
    type: 'array',
    key: 'tags[]',
    aliases: ['tags'],
    defaultValue: [],
  },
})

const availableTags = ['router', 'query', 'docs', 'debug']

const items = [
  {
    id: 1,
    title: 'Router setup guide',
    tags: ['router', 'docs'],
  },
  {
    id: 2,
    title: 'URL query troubleshooting',
    tags: ['query', 'debug'],
  },
  {
    id: 3,
    title: 'Combining router filters',
    tags: ['router', 'query'],
  },
  {
    id: 4,
    title: 'Release checklist',
    tags: ['docs'],
  },
]

const results = computed(() => {
  const selectedTags = state.tags.value

  if (!selectedTags.length) {
    return items
  }

  return items.filter((item) =>
    item.tags.some((tag) => selectedTags.includes(tag)),
  )
})

const snapshot = computed(() => JSON.stringify(state.values.value, null, 2))
const currentQuery = computed(() => JSON.stringify(route.query, null, 2))
const normalizedTags = computed(() => {
  return [...new Set([...availableTags, ...state.tags.value])].sort()
})
const aliasTagsPreview = computed(
  () => `tags=${state.tags.value.join('&tags=')}`,
)
const commaTagsPreview = computed(() => `tags=${state.tags.value.join(',')}`)
const hasTagQuery = computed(() => {
  return (
    Object.prototype.hasOwnProperty.call(route.query, 'tags[]') ||
    Object.prototype.hasOwnProperty.call(route.query, 'tags')
  )
})

function writePrimaryFormat() {
  state.patch({
    tags: state.tags.value,
  })
}

function loadAliasFormat() {
  if (!state.tags.value.length) {
    return
  }

  router.replace({
    query: {
      ...route.query,
      'tags[]': undefined,
      tags: state.tags.value,
    },
  })
}

function loadCommaFormat() {
  if (!state.tags.value.length) {
    return
  }

  router.replace({
    query: {
      ...route.query,
      'tags[]': undefined,
      tags: state.tags.value.join(','),
    },
  })
}

function toggleTag(tag) {
  const selectedTags = state.tags.value

  state.tags.value = selectedTags.includes(tag)
    ? selectedTags.filter((item) => item !== tag)
    : [...selectedTags, tag]
}

function addTag() {
  const tag = customTag.value.trim().toLowerCase()

  if (!tag || state.tags.value.includes(tag)) {
    customTag.value = ''
    return
  }

  state.tags.value = [...state.tags.value, tag]
  customTag.value = ''
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
      <h2>Tag filters</h2>
      <p>
        Array URL state with repeated query params, comma fallback, alias
        support, and custom tags.
      </p>
    </header>

    <form class="panel" @submit.prevent>
      <h3>Choose tags</h3>

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

      <label>
        Add custom tag
        <input
          v-model="customTag"
          placeholder="for example: release"
          @keydown.enter.prevent="addTag"
        />
      </label>

      <p class="actions">
        <button
          type="button"
          :disabled="
            !customTag.trim() ||
            state.tags.value.includes(customTag.trim().toLowerCase())
          "
          @click="addTag"
        >
          Add tag
        </button>
      </p>
    </form>

    <section class="panel">
      <h3>Switch URL format</h3>
      <p>Use the same selected tags, but write them with another URL shape.</p>
      <p>
        If the URL contains both <code>tags[]</code> and repeated
        <code>tags</code>, the library reads <code>tags[]</code> and ignores the
        alias values.
      </p>
      <p v-if="state.tags.value.length">
        {{ aliasTagsPreview }}<br />
        {{ commaTagsPreview }}
      </p>

      <p class="actions">
        <button
          type="button"
          :disabled="!state.tags.value.length"
          @click="writePrimaryFormat"
        >
          Use tags[]
        </button>
        <button
          type="button"
          :disabled="!state.tags.value.length"
          @click="loadAliasFormat"
        >
          Use repeated tags
        </button>
        <button
          type="button"
          :disabled="!state.tags.value.length"
          @click="loadCommaFormat"
        >
          Use comma tags
        </button>
      </p>
    </section>

    <section class="panel">
      <h3>URL actions</h3>
      <p class="actions">
        <button type="button" :disabled="!hasTagQuery" @click="resetState">
          Reset filters
        </button>
        <button type="button" :disabled="!hasTagQuery" @click="clearState">
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

    <section class="panel">
      <h3>Current query</h3>
      <pre>{{ currentQuery }}</pre>
    </section>

    <pre>{{ snapshot }}</pre>
  </section>
</template>
