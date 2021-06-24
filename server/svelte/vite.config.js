import {
  defineConfig
} from 'vite'
import {
  svelte
} from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../build',
    emptyOutDir: false,
  },
  plugins: [svelte()]
})