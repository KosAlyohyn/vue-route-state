import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'vue-route-state': fileURLToPath(
        new URL('../src/index.js', import.meta.url),
      ),
    },
  },
})
