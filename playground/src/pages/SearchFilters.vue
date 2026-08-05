<script setup>
import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'

import DemoInspector from '../components/DemoInspector.vue'

const schema = {
  query: {
    type: 'string',
    defaultValue: '',
  },
}

const state = useUrlState(schema)

const items = [
  {
    id: 1,
    title: 'Router query guide',
    category: 'docs',
  },
  {
    id: 2,
    title: 'Search state cookbook',
    category: 'issues',
  },
  {
    id: 3,
    title: 'Debugging route params',
    category: 'pull-requests',
  },
  {
    id: 4,
    title: 'Docs for query aliases',
    category: 'docs',
  },
]

const results = computed(() => {
  const query = state.query.value.trim().toLowerCase()

  return items.filter(
    (item) =>
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query),
  )
})

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
      <h2>Search filters</h2>
      <p>Basic URL-backed text search with one string parameter.</p>
    </header>

    <form class="panel" @submit.prevent>
      <label>
        Search query
        <input v-model="state.query.value" placeholder="Search by title" />
      </label>

      <p class="actions">
        <button type="button" @click="resetState">Reset filters</button>
        <button type="button" @click="clearState">Clear URL params</button>
      </p>
    </form>

    <section class="panel">
      <h3>Matching items</h3>
      <ul class="result-list">
        <li v-for="item in results" :key="item.id">
          <span>{{ item.title }}</span>
          <span>{{ item.category }}</span>
        </li>
      </ul>
    </section>

    <DemoInspector
      :schema="schema"
      :parsed-state="state.values.value"
    />
  </section>
</template>
