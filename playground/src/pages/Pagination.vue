<script setup>
import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'

import DemoInspector from '../components/DemoInspector.vue'

const schema = {
  page: {
    type: 'number',
    defaultValue: 1,
    positive: true,
    integer: true,
    omitDefault: true,
  },
  pageSize: {
    type: 'number',
    key: 'page_size',
    defaultValue: 5,
    allowedValues: [5, 10, 20],
    omitDefault: true,
  },
}

const state = useUrlState(schema)

const items = Array.from({ length: 22 }, (_, index) => ({
  id: index + 1,
  title: `Result ${index + 1}`,
}))

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(items.length / state.pageSize.value))
})
const currentPage = computed(() => Math.min(state.page.value, totalPages.value))
const visibleItems = computed(() => {
  const offset = (currentPage.value - 1) * state.pageSize.value

  return items.slice(offset, offset + state.pageSize.value)
})

function setPage(page) {
  state.page.value = Math.min(Math.max(page, 1), totalPages.value)
}

function setPageSize(pageSize) {
  state.patch({
    page: 1,
    pageSize: Number(pageSize),
  })
}

function resetPagination() {
  state.reset()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Pagination</h2>
      <p>
        Page and page size in the URL with integer validation, allowed values,
        and default omission.
      </p>
    </header>

    <section class="panel">
      <h3>Controls</h3>

      <div class="grid">
        <label>
          Page size
          <select
            :value="state.pageSize.value"
            @change="setPageSize($event.target.value)"
          >
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>
        </label>

        <label>
          Page
          <input
            :max="totalPages"
            min="1"
            :value="currentPage"
            type="number"
            @input="setPage(Number($event.target.value))"
          />
        </label>
      </div>

      <p class="actions">
        <button type="button" :disabled="currentPage <= 1" @click="setPage(currentPage - 1)">
          Previous
        </button>
        <button
          type="button"
          :disabled="currentPage >= totalPages"
          @click="setPage(currentPage + 1)"
        >
          Next
        </button>
        <button type="button" @click="resetPagination">Reset pagination</button>
      </p>
    </section>

    <section class="panel">
      <h3>Visible results</h3>
      <ul class="result-list">
        <li v-for="item in visibleItems" :key="item.id">
          <span>{{ item.title }}</span>
          <span>page {{ currentPage }} / {{ totalPages }}</span>
        </li>
      </ul>
    </section>

    <DemoInspector
      :schema="schema"
      :parsed-state="state.values.value"
    />
  </section>
</template>
