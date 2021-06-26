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
    proxy: {
      "/ws": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  plugins: [svelte()]
})