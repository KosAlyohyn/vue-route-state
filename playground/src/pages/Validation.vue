<script setup>
import { computed } from 'vue'
import { useUrlState } from 'vue-route-state'
import { useRoute } from 'vue-router'

import DemoInspector from '../components/DemoInspector.vue'

const route = useRoute()

const schema = {
  order: {
    type: 'string',
    defaultValue: 'newest',
    allowedValues: ['newest', 'oldest'],
  },
  page: {
    type: 'number',
    defaultValue: 1,
    positive: true,
    integer: true,
    allowedValues: [1, 2, 3],
  },
}

const state = useUrlState(schema)

const writeResult = computed(() => ({
  query: route.query,
  state: state.values.value,
}))
const allowedValues = {
  order: ['newest', 'oldest'],
  page: [1, 2, 3],
}
const allowedValuesJson = computed(() => JSON.stringify(allowedValues, null, 2))

async function writeValidValues() {
  await state.patch({
    order: 'oldest',
    page: 2,
  })
}

async function writeInvalidString() {
  await state.patch({
    order: 'invalid',
  })
}

async function writeInvalidNumber() {
  await state.patch({
    page: 99,
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
      <h2>Validation</h2>
      <p>
        String and number fields validate writes with the same rules they use
        when reading the URL.
      </p>
    </header>

    <section class="panel">
      <h3>Guarded writes</h3>
      <p>
        Valid values are written to the URL. Unsupported values are omitted, so
        the library does not write a query value it would later reject.
      </p>

      <p class="actions">
        <button type="button" @click="writeValidValues">
          Write valid values
        </button>
        <button type="button" @click="writeInvalidString">
          Try order=invalid
        </button>
        <button type="button" @click="writeInvalidNumber">Try page=99</button>
        <button type="button" @click="resetState">Reset</button>
        <button type="button" @click="clearState">Clear URL params</button>
      </p>

      <div class="debug-grid">
        <div>
          <h4>Current result</h4>
          <pre>{{ JSON.stringify(writeResult, null, 2) }}</pre>
        </div>
        <div>
          <h4>Allowed values</h4>
          <pre>{{ allowedValuesJson }}</pre>
        </div>
      </div>
    </section>

    <DemoInspector :schema="schema" :parsed-state="state.values.value" />
  </section>
</template>
