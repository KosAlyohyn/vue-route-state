<script setup>
const links = [
  { to: '/search', label: 'Search filters' },
  { to: '/boolean', label: 'Boolean filters' },
  { to: '/date', label: 'Date filters' },
  { to: '/tag', label: 'Tag filters' },
  { to: '/legacy', label: 'Legacy URLs' },
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
        <router-link v-for="link in links" :key="link.to" :to="link.to">
          {{ link.label }}
        </router-link>
      </nav>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>
