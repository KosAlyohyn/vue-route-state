<script setup>
const navGroups = [
  {
    label: 'Guide',
    links: [{ to: '/docs', label: 'Docs' }],
  },
  {
    label: 'Search & pagination',
    links: [
      { to: '/search', label: 'Search' },
      { to: '/pagination', label: 'Pagination' },
    ],
  },
  {
    label: 'Filters',
    links: [
      { to: '/boolean', label: 'Boolean filters' },
      { to: '/date', label: 'Date filters' },
      { to: '/tag', label: 'Tag filters' },
      { to: '/groups', label: 'Field groups' },
    ],
  },
  {
    label: 'Integration',
    links: [
      { to: '/legacy', label: 'Legacy URL' },
      { to: '/custom', label: 'Custom codec' },
    ],
  },
]
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div>
        <p class="eyebrow">Playground</p>
        <h1>vue-route-state</h1>
      </div>

      <nav class="nav">
        <section v-for="group in navGroups" :key="group.label" class="nav-group">
          <h2>{{ group.label }}</h2>
          <router-link v-for="link in group.links" :key="link.to" :to="link.to">
            {{ link.label }}
          </router-link>
        </section>
      </nav>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>
