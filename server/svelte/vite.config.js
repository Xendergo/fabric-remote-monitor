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
      "/ws": {
        target: "https://localhost:8000/ws",
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  plugins: [svelte()]
})