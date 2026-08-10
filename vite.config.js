import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js',
      name: 'VueRouteState',
      fileName: (format) =>
        format === 'es' ? 'vue-route-state.js' : 'vue-route-state.cjs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
      },
    },
  },
})
