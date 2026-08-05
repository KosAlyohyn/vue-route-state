<script setup>
import { computed, ref } from 'vue'
import { useUrlState } from 'vue-route-state'
import { useRoute, useRouter } from 'vue-router'

import DemoInspector from '../components/DemoInspector.vue'

const route = useRoute()
const router = useRouter()
const omitFalseInUrl = ref(false)

const schema = {
  value: {
    type: 'boolean',
    defaultValue: false,
  },
}

const state = useUrlState(schema)

const items = [
  {
    id: 1,
    title: 'Visible when filter is enabled',
    visibleWhenEnabled: true,
  },
  {
    id: 2,
    title: 'Visible when filter is disabled',
    visibleWhenEnabled: false,
  },
]

const results = computed(() => {
  return items.filter((item) => item.visibleWhenEnabled === state.value.value)
})

const hasBooleanQuery = computed(() => {
  return Object.prototype.hasOwnProperty.call(route.query, 'value')
})
const currentFormat = computed(() => {
  const rawValue = route.query.value
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue

  return value === '1' || value === '0' ? 'numeric' : 'text'
})

function setCanonicalTrue() {
  writeBooleanValue('text', true)
}

function setCanonicalFalse() {
  writeBooleanValue('text', false)
}

function writeTextBooleanValue() {
  writeBooleanValue('text', state.value.value)
}

function writeCanonicalValue() {
  writeBooleanValue('numeric', state.value.value)
}

function syncOmitFalseSetting() {
  writeBooleanValue(currentFormat.value, state.value.value)
}

function writeBooleanValue(format, value) {
  const nextValue =
    !value && omitFalseInUrl.value
      ? undefined
      : format === 'numeric'
        ? value
          ? '1'
          : '0'
        : String(value)

  router.replace({
    query: {
      ...route.query,
      value: nextValue,
    },
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
      <h2>Boolean filters</h2>
      <p>
        Boolean URL state with one key and two supported value formats:
        <code>1</code>/<code>0</code> and <code>true</code>/<code>false</code>.
      </p>
    </header>

    <section class="panel">
      <h3>Choose value</h3>

      <div class="checkbox-row">
        <label class="checkbox">
          <input
            :checked="state.value.value"
            type="radio"
            name="boolean-value"
            @change="setCanonicalTrue"
          />
          value=true
        </label>

        <label class="checkbox">
          <input
            :checked="!state.value.value"
            type="radio"
            name="boolean-value"
            @change="setCanonicalFalse"
          />
          value=false
        </label>
      </div>

      <label class="checkbox">
        <input
          v-model="omitFalseInUrl"
          type="checkbox"
          @change="syncOmitFalseSetting"
        />
        Hide false from URL
      </label>
    </section>

    <section class="panel">
      <h3>Switch URL format</h3>
      <p class="actions">
        <button type="button" @click="writeCanonicalValue">Use `1 / 0`</button>
        <button type="button" @click="writeTextBooleanValue">
          Use `true / false`
        </button>
      </p>
    </section>

    <section class="panel">
      <h3>URL actions</h3>
      <p class="actions">
        <button type="button" :disabled="!hasBooleanQuery" @click="resetState">
          Reset filters
        </button>
        <button type="button" :disabled="!hasBooleanQuery" @click="clearState">
          Clear URL params
        </button>
      </p>
    </section>

    <section class="panel">
      <h3>Matching items</h3>
      <ul class="result-list">
        <li v-for="item in results" :key="item.id">
          <span>{{ item.title }}</span>
          <span>{{ item.visibleWhenEnabled ? 'true' : 'false' }}</span>
        </li>
      </ul>
    </section>

    <DemoInspector
      :schema="schema"
      :parsed-state="state.values.value"
    />
  </section>
</template>
