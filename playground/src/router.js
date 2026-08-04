import { createRouter, createWebHistory } from 'vue-router'

import BooleanFilters from './pages/BooleanFilters.vue'
import CustomParams from './pages/CustomParams.vue'
import DateFilters from './pages/DateFilters.vue'
import Docs from './pages/Docs.vue'
import Groups from './pages/Groups.vue'
import LegacyUrls from './pages/LegacyUrls.vue'
import SearchFilters from './pages/SearchFilters.vue'
import TagFilters from './pages/TagFilters.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/docs',
    },
    {
      path: '/docs',
      name: 'docs',
      component: Docs,
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
      path: '/groups',
      name: 'groups',
      component: Groups,
    },
    {
      path: '/custom',
      name: 'custom',
      component: CustomParams,
    },
    {
      path: '/legacy',
      name: 'legacy',
      component: LegacyUrls,
    },
  ],
})
