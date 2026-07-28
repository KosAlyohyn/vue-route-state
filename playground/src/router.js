import { createRouter, createWebHistory } from 'vue-router'

import BooleanFilters from './pages/BooleanFilters.vue'
import DateFilters from './pages/DateFilters.vue'
import LegacyUrls from './pages/LegacyUrls.vue'
import SearchFilters from './pages/SearchFilters.vue'
import TagFilters from './pages/TagFilters.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/search',
    },
    {
      path: '/search',
      name: 'search',
      component: SearchFilters,
    },
    {
      path: '/boolean',
      name: 'boolean',
      component: BooleanFilters,
    },
    {
      path: '/date',
      name: 'date',
      component: DateFilters,
    },
    {
      path: '/tag',
      name: 'tag',
      component: TagFilters,
    },
    {
      path: '/legacy',
      name: 'legacy',
      component: LegacyUrls,
    },
  ],
})
