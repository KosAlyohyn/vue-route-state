import { createRouter, createWebHashHistory } from 'vue-router'

import BooleanFilters from './pages/BooleanFilters.vue'
import CustomParams from './pages/CustomParams.vue'
import DateFilters from './pages/DateFilters.vue'
import Docs from './pages/Docs.vue'
import Groups from './pages/Groups.vue'
import LegacyUrls from './pages/LegacyUrls.vue'
import Pagination from './pages/Pagination.vue'
import SearchFilters from './pages/SearchFilters.vue'
import TagFilters from './pages/TagFilters.vue'
import Validation from './pages/Validation.vue'

export const router = createRouter({
  history: createWebHashHistory(),
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
      path: '/pagination',
      name: 'pagination',
      component: Pagination,
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
      path: '/validation',
      name: 'validation',
      component: Validation,
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
