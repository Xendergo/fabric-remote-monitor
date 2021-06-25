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
  server: {
    https: true,
    proxy: {
      "/ws": "localhost:8000/ws"
    }
  },
  plugins: [svelte()]
})