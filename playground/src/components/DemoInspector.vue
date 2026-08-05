<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  schema: {
    type: Object,
    default: null,
  },
  codeLabel: {
    type: String,
    default: 'Schema / code',
  },
  parsedState: {
    type: null,
    required: true,
  },
  stateLabel: {
    type: String,
    default: 'Parsed state',
  },
})

const route = useRoute()
const copied = ref('')

const liveQuery = computed(() => JSON.stringify(route.query, null, 2))
const parsedStateJson = computed(() => {
  return typeof props.parsedState === 'string'
    ? props.parsedState
    : JSON.stringify(props.parsedState, null, 2)
})
const displayCode = computed(() => {
  if (props.code) {
    return props.code
  }

  if (!props.schema) {
    return ''
  }

  return (
    'const schema = ' +
    formatValue(props.schema) +
    '\n\nconst state = useUrlState(schema)'
  )
})
const currentUrl = computed(() => {
  if (typeof window === 'undefined') {
    return route.fullPath
  }

  return window.location.origin + route.fullPath
})

function formatValue(value, level = 0) {
  if (Array.isArray(value)) {
    return '[' + value.map((item) => formatValue(item, level)).join(', ') + ']'
  }

  if (!value || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  const indent = '  '.repeat(level)
  const nextIndent = '  '.repeat(level + 1)
  const entries = Object.entries(value).map(([key, item]) => {
    return nextIndent + key + ': ' + formatValue(item, level + 1)
  })

  return ['{', entries.join(',\n'), indent + '}'].join('\n')
}

async function copyText(name, value) {
  if (!value) {
    return
  }

  await navigator.clipboard.writeText(value)
  copied.value = name

  window.setTimeout(() => {
    if (copied.value === name) {
      copied.value = ''
    }
  }, 1400)
}
</script>

<template>
  <section class="panel demo-inspector">
    <div class="demo-inspector__header">
      <h3>Demo state</h3>

      <p class="actions">
        <button type="button" @click="copyText('url', currentUrl)">
          {{ copied === 'url' ? 'Copied URL' : 'Copy URL' }}
        </button>
        <button
          v-if="displayCode"
          type="button"
          @click="copyText('code', displayCode)"
        >
          {{ copied === 'code' ? 'Copied code' : 'Copy code' }}
        </button>
      </p>
    </div>

    <div class="debug-grid">
      <div>
        <h4>Live URL query</h4>
        <pre>{{ liveQuery }}</pre>
      </div>
      <div>
        <h4>{{ stateLabel }}</h4>
        <pre>{{ parsedStateJson }}</pre>
      </div>
    </div>

    <div v-if="displayCode" class="demo-code-panel">
      <h4>{{ codeLabel }}</h4>
      <pre><code>{{ displayCode }}</code></pre>
    </div>
  </section>
</template>
