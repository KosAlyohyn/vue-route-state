<script setup>
import { computed, ref } from 'vue'
import { useUrlState } from 'vue-route-state'

import DemoInspector from '../components/DemoInspector.vue'

const exampleCode = `const state = useUrlState(schema, {
  order: ['view', 'detailTab', 'detailPage'],
  groups: {
    details: {
      fields: ['detailTab', 'detailPage'],
      clearWhenDisabled: true,
      enabledWhen: ({ values }) => values.view === 'details',
    },
  },
})`

const clearWhenDisabled = ref(true)

const schema = {
  view: {
    type: 'string',
    defaultValue: 'list',
    allowedValues: ['list', 'details'],
  },
  detailTab: {
    type: 'string',
    key: 'detail_tab',
    defaultValue: 'summary',
    allowedValues: ['summary', 'activity', 'settings'],
  },
  detailPage: {
    type: 'number',
    key: 'detail_page',
    defaultValue: 1,
    positive: true,
  },
}

function options(clearWhenDisabled) {
  return {
    order: ['view', 'detailTab', 'detailPage'],
    groups: {
      details: {
        fields: ['detailTab', 'detailPage'],
        clearWhenDisabled,
        enabledWhen: ({ values }) => values.view === 'details',
      },
    },
  }
}

const clearState = useUrlState(schema, options(true))
const preserveState = useUrlState(schema, options(false))
const state = computed(() =>
  clearWhenDisabled.value ? clearState : preserveState,
)

const parsedValues = computed(() => state.value.values.value)
const isDetails = computed(() => state.value.view.value === 'details')

function openDetails() {
  state.value.patch({
    view: 'details',
    detailTab: 'activity',
    detailPage: 2,
  })
}

function switchToList() {
  state.value.patch({ view: 'list' })
}

function switchToDetails() {
  state.value.patch({ view: 'details' })
}

function resetState() {
  state.value.reset()
}
</script>

<template>
  <section class="page">
    <header class="page-header">
      <h2>Field groups</h2>
      <p>
        Shared availability rules for related URL fields, with configurable
        cleanup when a group becomes disabled.
      </p>
    </header>

    <section class="panel">
      <h3>Group behavior</h3>

      <label class="checkbox">
        <input v-model="clearWhenDisabled" type="checkbox" />
        clearWhenDisabled
      </label>

      <p>
        The details group is enabled only when <code>view=details</code>. When
        disabled, grouped refs read their defaults.
      </p>
    </section>

    <form class="panel" @submit.prevent>
      <h3>Controls</h3>

      <div class="grid">
        <label>
          View
          <select v-model="state.view.value">
            <option value="list">list</option>
            <option value="details">details</option>
          </select>
        </label>

        <label>
          Detail tab
          <select v-model="state.detailTab.value" :disabled="!isDetails">
            <option value="summary">summary</option>
            <option value="activity">activity</option>
            <option value="settings">settings</option>
          </select>
        </label>

        <label>
          Detail page
          <input
            v-model.number="state.detailPage.value"
            :disabled="!isDetails"
            min="1"
            type="number"
          />
        </label>
      </div>

      <p class="actions">
        <button type="button" @click="openDetails">Set details values</button>
        <button type="button" @click="switchToList">Switch to list</button>
        <button type="button" @click="switchToDetails">
          Switch to details
        </button>
        <button type="button" @click="resetState">Reset</button>
      </p>
    </form>

    <DemoInspector
      :code="exampleCode"
      code-label="Example code"
      :parsed-state="parsedValues"
    />
  </section>
</template>
