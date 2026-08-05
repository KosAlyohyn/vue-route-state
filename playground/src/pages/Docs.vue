<script setup>
const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    summary:
      'Create URL-backed state from a schema and bind it to normal Vue inputs.',
    code: `import { useUrlState } from 'vue-route-state'

const state = useUrlState({
  search: {
    type: 'string',
    defaultValue: '',
  },
  page: {
    type: 'number',
    defaultValue: 1,
    positive: true,
    integer: true,
  },
})`,
  },
  {
    id: 'installation',
    title: 'Installation',
    summary:
      'Install the package next to Vue Router. Vue and Vue Router stay peer dependencies.',
    code: `npm install vue-route-state

// main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [],
})

createApp(App).use(router).mount('#app')`,
  },
  {
    id: 'why',
    title: 'Why?',
    summary:
      'Use the URL as the source for shareable filters, pagination, and browser navigation without manual query parsing.',
    points: [
      'Reactive values stay synchronized with route.query.',
      'Invalid or empty values fall back to explicit defaults.',
      'Writes preserve route name, params, hash, and unmanaged query keys.',
    ],
  },
  {
    id: 'basic-examples',
    title: 'Basic Examples',
    summary:
      'Use fields directly as writable computed refs, or update multiple fields with patch().',
    code: `<input v-model="state.search.value" />

await state.patch({
  search: 'router',
  page: 1,
})

await state.reset('page')
await state.clear('search')`,
  },
  {
    id: 'complex-filters',
    title: 'Complex Filters',
    summary:
      'Compose strings, numbers, booleans, arrays, dates, aliases, and field groups in one schema.',
    code: `const filters = useUrlState(
  {
    query: { type: 'string', defaultValue: '' },
    tags: {
      type: 'array',
      key: 'tags[]',
      aliases: ['tags'],
      defaultValue: [],
      allowedValues: ['docs', 'api', 'router'],
    },
    withDocs: {
      type: 'boolean',
      key: 'with_docs',
      defaultValue: false,
    },
  },
  {
    history: 'replace',
  },
)`,
  },
  {
    id: 'validation',
    title: 'Validation',
    summary:
      'Constrain URL values near the parser and return defaultValue when the URL is unsupported.',
    code: `const state = useUrlState({
  page: {
    type: 'number',
    defaultValue: 1,
    positive: true,
    integer: true,
  },
  status: {
    type: 'string',
    defaultValue: 'open',
    allowedValues: ['open', 'closed'],
  },
})`,
  },
  {
    id: 'custom-codecs',
    title: 'Custom Codecs',
    summary:
      'Use custom fields when a value has its own URL format, and transform values for normalization.',
    code: `const state = useUrlState({
  sort: {
    type: 'custom',
    defaultValue: { key: 'name', order: 'asc' },
    parse(raw, field) {
      const [key, order] = String(raw || '').split(':')
      return key && order ? { key, order } : field.defaultValue
    },
    serialize(value, field) {
      return value.key === field.defaultValue.key ? null : value.key + ':' + value.order
    },
  },
  search: {
    type: 'string',
    defaultValue: '',
    transform(value) {
      return value.trim()
    },
  },
})`,
  },
  {
    id: 'migration',
    title: 'Migration',
    summary:
      'Move query helpers into schema fields gradually. Aliases help read old URLs while writing current keys.',
    code: `const state = useUrlState({
  search: {
    type: 'string',
    key: 'search',
    aliases: ['q'],
    defaultValue: '',
  },
})

// Reads ?q=router, writes ?search=router
await state.patch({ search: state.search.value })`,
  },
  {
    id: 'faq',
    title: 'FAQ',
    summary: 'The short answers that remove first-use friction.',
    points: [
      'Defaults are explicit. Missing, empty, or invalid scalar values return defaultValue.',
      'Array values can be repeated params or comma-separated legacy values.',
      'Use router injection for tests, SSR-style wrappers, or libraries built on top of vue-route-state.',
    ],
  },
]
const examples = [
  {
    group: 'Search & pagination',
    links: [
      {
        to: '/search',
        title: 'Search',
        summary: 'One string field backed by the URL.',
      },
      {
        to: '/pagination',
        title: 'Pagination',
        summary: 'Positive integer page state with default omission.',
      },
    ],
  },
  {
    group: 'Filters',
    links: [
      {
        to: '/boolean',
        title: 'Boolean filters',
        summary: 'Boolean values with text and numeric URL formats.',
      },
      {
        to: '/date',
        title: 'Date filters',
        summary: 'Strict YYYY-MM-DD parsing and canonical writes.',
      },
      {
        to: '/tag',
        title: 'Tag filters',
        summary: 'Array params, aliases, comma fallback, and validation.',
      },
      {
        to: '/groups',
        title: 'Field groups',
        summary: 'Shared availability rules for related fields.',
      },
    ],
  },
  {
    group: 'Integration',
    links: [
      {
        to: '/legacy',
        title: 'Legacy URLs',
        summary: 'Read old query keys while writing current keys.',
      },
      {
        to: '/custom',
        title: 'Custom codec',
        summary: 'Low-level query params and schema custom fields.',
      },
    ],
  },
]
</script>

<template>
  <section class="page docs-page">
    <header class="page-header docs-hero">
      <p class="eyebrow">Documentation</p>
      <h2>URL state for Vue Router</h2>
      <p>
        A focused guide for building shareable search, pagination, filters,
        legacy URL support, and custom query formats with vue-route-state.
      </p>
    </header>

    <nav class="docs-toc" aria-label="Documentation sections">
      <a v-for="section in sections" :key="section.id" :href="`#${section.id}`">
        {{ section.title }}
      </a>
    </nav>

    <section class="docs-examples" aria-labelledby="examples-heading">
      <div class="docs-copy">
        <h3 id="examples-heading">Live Examples</h3>
        <p>
          Open a scenario, change the controls, and compare the live URL query
          with the parsed state and schema panel.
        </p>
      </div>

      <div class="example-groups">
        <section
          v-for="group in examples"
          :key="group.group"
          class="example-group"
        >
          <h4>{{ group.group }}</h4>
          <router-link
            v-for="link in group.links"
            :key="link.to"
            class="example-link"
            :to="link.to"
          >
            <span>{{ link.title }}</span>
            <small>{{ link.summary }}</small>
          </router-link>
        </section>
      </div>
    </section>

    <article
      v-for="section in sections"
      :id="section.id"
      :key="section.id"
      class="docs-section"
      :class="{ 'docs-section_plain': !section.code }"
    >
      <div class="docs-copy">
        <h3>{{ section.title }}</h3>
        <p>{{ section.summary }}</p>

        <ul v-if="section.points" class="docs-list">
          <li v-for="point in section.points" :key="point">{{ point }}</li>
        </ul>
      </div>

      <pre v-if="section.code"><code>{{ section.code }}</code></pre>
    </article>
  </section>
</template>
