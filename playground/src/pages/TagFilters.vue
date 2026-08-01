<script setup>
import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const availableTags = ['router', 'query', 'docs', 'debug']

const state = useUrlState({
  tags: {
    type: 'array',
    key: 'tags[]',
    aliases: ['tags'],
    defaultValue: [],
    allowedValues: availableTags,
  },
})

const strictState = useUrlState({
  strictTags: {
    type: 'array',
    key: 'strict_tags[]',
    aliases: ['strict_tags'],
    defaultValue: [],
    allowedValues: availableTags,
    invalidValues: 'default',
  },
})

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
const strictSnapshot = computed(() =>
  JSON.stringify(strictState.values.value, null, 2),
)
const currentQuery = computed(() => JSON.stringify(route.query, null, 2))
const aliasTagsPreview = computed(
  () => `tags=${state.tags.value.join('&tags=')}`,
)
const commaTagsPreview = computed(() => `tags=${state.tags.value.join(',')}`)
const hasTagQuery = computed(() => {
  return ['tags[]', 'tags', 'strict_tags[]', 'strict_tags'].some((key) =>
    Object.prototype.hasOwnProperty.call(route.query, key),
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

function loadInvalidFilterUrl() {
  router.replace({
    query: {
      ...route.query,
      'tags[]': ['router', 'unknown'],
      tags: undefined,
    },
  })
}

function loadInvalidDefaultUrl() {
  router.replace({
    query: {
      ...route.query,
      'strict_tags[]': ['router', 'unknown'],
      strict_tags: undefined,
    },
  })
}

function toggleTag(tag) {
  const selectedTags = state.tags.value

  state.tags.value = selectedTags.includes(tag)
    ? selectedTags.filter((item) => item !== tag)
    : [...selectedTags, tag]
}

function resetState() {
  state.reset()
  strictState.reset()
}

function clearState() {
  state.clear()
  strictState.clear()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Tag filters</h2>
      <p>
        Array URL state with repeated query params, comma fallback, aliases,
        allowed values, and invalid value handling.
      </p>
    </header>

    <form class="panel" @submit.prevent>
      <h3>Choose tags</h3>

      <div class="tag-list">
        <label v-for="tag in availableTags" :key="tag">
          <input
            :checked="state.tags.value.includes(tag)"
            type="checkbox"
            @change="toggleTag(tag)"
          />
          {{ tag }}
        </label>
      </div>
    </form>

    <section class="panel">
      <h3>Allowed values</h3>
      <p>
        The default array mode filters unsupported values and keeps supported
        ones. The strict example uses <code>invalidValues: 'default'</code>.
      </p>

      <p class="actions">
        <button type="button" @click="loadInvalidFilterUrl">
          Load tags[]=router&tags[]=unknown
        </button>
        <button type="button" @click="loadInvalidDefaultUrl">
          Load strict_tags[]=router&strict_tags[]=unknown
        </button>
      </p>

      <div class="debug-grid">
        <div>
          <h4>filter</h4>
          <pre>{{ snapshot }}</pre>
        </div>
        <div>
          <h4>default</h4>
          <pre>{{ strictSnapshot }}</pre>
        </div>
      </div>
    </section>

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
  </section>
</template>
