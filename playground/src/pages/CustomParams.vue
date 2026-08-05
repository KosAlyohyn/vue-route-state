<script setup>
import { computed } from 'vue'
import { useUrlQueryParam, useUrlState } from 'vue-route-state'
import { useRoute, useRouter } from 'vue-router'

import DemoInspector from '../components/DemoInspector.vue'

const exampleCode = `const sort = useUrlQueryParam('sort', {
  defaultValue: { key: 'name', order: 'asc' },
  parse(value, defaultValue) {
    const raw = Array.isArray(value) ? value[0] : value
    const [key, order] = String(raw || '').split(':')

    return key && order ? { key, order } : defaultValue
  },
  serialize(value, defaultValue) {
    return value.key === defaultValue.key && value.order === defaultValue.order
      ? null
      : value.key + ':' + value.order
  },
})

const schemaState = useUrlState({
  schemaSearch: {
    type: 'string',
    key: 'schema_search',
    defaultValue: '',
    transform(value) {
      return String(value).trim()
    },
  },
  schemaSort: {
    type: 'custom',
    key: 'schema_sort',
    defaultValue: { key: 'name', order: 'asc' },
    parse(raw, field) {
      const [key, order] = String(raw || '').split(':')
      return key && order ? { key, order } : field.defaultValue
    },
    serialize(value) {
      return value.key + ':' + value.order
    },
  },
})`

const route = useRoute()
const router = useRouter()
const sortKeys = ['name', 'created_at', 'status']
const sortOrders = ['asc', 'desc']

const archived = useUrlQueryParam('archived', {
  defaultValue: false,
  parse(value, defaultValue) {
    const raw = Array.isArray(value) ? value[0] : value

    if (raw == null || raw === '') {
      return defaultValue
    }

    return raw === 'yes'
  },
  serialize(value) {
    return value ? 'yes' : null
  },
})

const sort = useUrlQueryParam('sort', {
  defaultValue: { key: 'name', order: 'asc' },
  parse(value, defaultValue) {
    const raw = Array.isArray(value) ? value[0] : value
    const [key, order] = String(raw || '').split(':')

    if (!sortKeys.includes(key) || !sortOrders.includes(order)) {
      return defaultValue
    }

    return { key, order }
  },
  serialize(value, defaultValue) {
    if (
      value.key === defaultValue.key &&
      value.order === defaultValue.order
    ) {
      return null
    }

    return `${value.key}:${value.order}`
  },
})

const payload = useUrlQueryParam('payload', {
  defaultValue: { pageSize: 20, compact: false },
  parse(value, defaultValue) {
    const raw = Array.isArray(value) ? value[0] : value

    if (!raw) {
      return defaultValue
    }

    try {
      const parsed = JSON.parse(String(raw))
      return {
        pageSize: Number(parsed.pageSize) || defaultValue.pageSize,
        compact: Boolean(parsed.compact),
      }
    } catch {
      return defaultValue
    }
  },
  serialize(value, defaultValue) {
    if (
      value.pageSize === defaultValue.pageSize &&
      value.compact === defaultValue.compact
    ) {
      return null
    }

    return JSON.stringify(value)
  },
})

const schemaState = useUrlState({
  schemaSearch: {
    type: 'string',
    key: 'schema_search',
    defaultValue: '',
    transform(value) {
      return String(value).trim()
    },
  },
  schemaSort: {
    type: 'custom',
    key: 'schema_sort',
    defaultValue: { key: 'name', order: 'asc' },
    parse(raw, field) {
      const [key, order] = String(raw || '').split(':')

      if (!sortKeys.includes(key) || !sortOrders.includes(order)) {
        return field.defaultValue
      }

      return { key, order }
    },
    serialize(value) {
      return value.key + ':' + value.order
    },
  },
})

const demoState = computed(() => ({
  queryParam: {
    archived: archived.value,
    sort: sort.value,
    payload: payload.value,
  },
  schema: schemaState.values.value,
}))
const hasManagedQuery = computed(() => {
  return [
    'archived',
    'sort',
    'payload',
    'schema_search',
    'schema_sort',
  ].some((key) => Object.prototype.hasOwnProperty.call(route.query, key))
})

function setSortKey(key) {
  sort.value = { ...sort.value, key }
}

function setSortOrder(order) {
  sort.value = { ...sort.value, order }
}

function setPageSize(pageSize) {
  payload.value = {
    ...payload.value,
    pageSize: Number(pageSize) || 20,
  }
}

function setSchemaSortKey(key) {
  schemaState.schemaSort.value = { ...schemaState.schemaSort.value, key }
}

function setSchemaSortOrder(order) {
  schemaState.schemaSort.value = { ...schemaState.schemaSort.value, order }
}

function toggleCompact() {
  payload.value = {
    ...payload.value,
    compact: !payload.value.compact,
  }
}

function loadLegacyValues() {
  router.replace({
    query: {
      ...route.query,
      archived: 'yes',
      sort: 'status:desc',
      schema_search: '  router  ',
      schema_sort: 'created_at:desc',
    },
  })
}

function loadMalformedValues() {
  router.replace({
    query: {
      ...route.query,
      archived: 'maybe',
      sort: 'broken:value',
      payload: '{bad-json',
      schema_search: '   ',
      schema_sort: 'broken:value',
    },
  })
}

function resetState() {
  archived.value = false
  sort.value = { key: 'name', order: 'asc' }
  payload.value = { pageSize: 20, compact: false }
  schemaState.reset()
}

function clearState() {
  router.replace({
    query: {
      ...route.query,
      archived: undefined,
      sort: undefined,
      payload: undefined,
      schema_search: undefined,
      schema_sort: undefined,
    },
  })
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Custom params</h2>
      <p>
        Low-level custom query params and schema-based custom fields with
        value transforms.
      </p>
    </header>

    <section class="panel">
      <h3>Legacy value</h3>
      <label class="checkbox">
        <input v-model="archived" type="checkbox" />
        archived=yes
      </label>
    </section>

    <section class="panel">
      <h3>Structured sort</h3>
      <div class="grid">
        <label>
          Key
          <select :value="sort.key" @change="setSortKey($event.target.value)">
            <option v-for="key in sortKeys" :key="key" :value="key">
              {{ key }}
            </option>
          </select>
        </label>

        <label>
          Order
          <select
            :value="sort.order"
            @change="setSortOrder($event.target.value)"
          >
            <option v-for="order in sortOrders" :key="order" :value="order">
              {{ order }}
            </option>
          </select>
        </label>
      </div>
    </section>

    <section class="panel">
      <h3>Compact payload</h3>
      <div class="grid">
        <label>
          Page size
          <input
            :value="payload.pageSize"
            min="5"
            step="5"
            type="number"
            @input="setPageSize($event.target.value)"
          />
        </label>

        <label class="checkbox">
          <input
            :checked="payload.compact"
            type="checkbox"
            @change="toggleCompact"
          />
          compact=true
        </label>
      </div>
    </section>

    <section class="panel">
      <h3>Schema custom field</h3>
      <div class="grid">
        <label>
          Search with transform
          <input
            v-model="schemaState.schemaSearch.value"
            placeholder="Whitespace is trimmed"
          />
        </label>

        <label>
          Sort key
          <select
            :value="schemaState.schemaSort.value.key"
            @change="setSchemaSortKey($event.target.value)"
          >
            <option v-for="key in sortKeys" :key="key" :value="key">
              {{ key }}
            </option>
          </select>
        </label>

        <label>
          Sort order
          <select
            :value="schemaState.schemaSort.value.order"
            @change="setSchemaSortOrder($event.target.value)"
          >
            <option v-for="order in sortOrders" :key="order" :value="order">
              {{ order }}
            </option>
          </select>
        </label>
      </div>
    </section>

    <section class="panel">
      <h3>URL actions</h3>
      <p class="actions">
        <button type="button" @click="loadLegacyValues">
          Load valid custom values
        </button>
        <button type="button" @click="loadMalformedValues">
          Load malformed values
        </button>
        <button
          type="button"
          :disabled="!hasManagedQuery"
          @click="resetState"
        >
          Reset params
        </button>
        <button
          type="button"
          :disabled="!hasManagedQuery"
          @click="clearState"
        >
          Clear URL params
        </button>
      </p>
    </section>

    <DemoInspector
      :code="exampleCode"
      code-label="Example code"
      :parsed-state="demoState"
    />
  </section>
</template>
