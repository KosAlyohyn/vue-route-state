<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUrlState } from 'vue-url-state'

const route = useRoute()
const router = useRouter()
const rawPeriodStart = ref('')
const rawPeriodEnd = ref('')

const state = useUrlState({
  periodStart: {
    type: 'date',
    key: 'period_start',
    defaultValue: null,
  },
  periodEnd: {
    type: 'date',
    key: 'period_end',
    defaultValue: null,
  },
})

const events = [
  {
    id: 1,
    title: 'Planning kickoff',
    date: '2026-01-15',
  },
  {
    id: 2,
    title: 'Design review',
    date: '2026-02-02',
  },
  {
    id: 3,
    title: 'Release candidate',
    date: '2026-03-18',
  },
  {
    id: 4,
    title: 'Public launch',
    date: '2026-04-07',
  },
]

const results = computed(() => {
  const start = state.periodStart.value
  const end = state.periodEnd.value

  return events.filter((event) => {
    return (!start || event.date >= start) && (!end || event.date <= end)
  })
})

const currentQuery = computed(() => JSON.stringify(route.query, null, 2))
const snapshot = computed(() => JSON.stringify(state.values.value, null, 2))
const hasDateQuery = computed(() => {
  return (
    Object.prototype.hasOwnProperty.call(route.query, 'period_start') ||
    Object.prototype.hasOwnProperty.call(route.query, 'period_end')
  )
})
const hasRawDateQuery = computed(() => {
  return rawPeriodStart.value || rawPeriodEnd.value
})

watch(
  () => route.query,
  (query) => {
    rawPeriodStart.value = firstQueryValue(query.period_start) ?? ''
    rawPeriodEnd.value = firstQueryValue(query.period_end) ?? ''
  },
  { immediate: true },
)

function firstQueryValue(value) {
  return Array.isArray(value) ? value[0] : value
}

function writeRawDates() {
  router.replace({
    query: {
      ...route.query,
      period_start: rawPeriodStart.value || undefined,
      period_end: rawPeriodEnd.value || undefined,
    },
  })
}

function loadInvalidDates() {
  rawPeriodStart.value = '2026-1-01'
  rawPeriodEnd.value = '2026-01-31'
  writeRawDates()
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
      <h2>Date filters</h2>
      <p>
        Date URL state with strict <code>YYYY-MM-DD</code> parsing and canonical
        writes from strings or Date objects.
      </p>
    </header>

    <form class="panel" @submit.prevent>
      <h3>Choose period with native date inputs</h3>

      <div class="grid">
        <label>
          Start date
          <input v-model="state.periodStart.value" type="date" />
        </label>

        <label>
          End date
          <input v-model="state.periodEnd.value" type="date" />
        </label>
      </div>
    </form>

    <form class="panel">
      <h3>Write raw URL values</h3>

      <div class="grid">
        <label>
          Raw period_start
          <input v-model="rawPeriodStart" placeholder="2026-1-01" />
        </label>

        <label>
          Raw period_end
          <input v-model="rawPeriodEnd" placeholder="2026-01-31" />
        </label>
      </div>

      <p class="actions">
        <button
          type="button"
          :disabled="!hasRawDateQuery"
          @click="writeRawDates"
        >
          Apply the entered data
        </button>
        <button type="button" @click="loadInvalidDates">
          Load invalid URL dates
        </button>
      </p>
    </form>

    <section class="panel">
      <h3>URL actions</h3>
      <p class="actions">
        <button type="button" :disabled="!hasDateQuery" @click="resetState">
          Reset filters
        </button>
        <button type="button" :disabled="!hasDateQuery" @click="clearState">
          Clear URL params
        </button>
      </p>
    </section>

    <section class="panel">
      <h3>Matching events</h3>
      <ul class="result-list">
        <li v-for="event in results" :key="event.id">
          <span>{{ event.title }}</span>
          <span>{{ event.date }}</span>
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
