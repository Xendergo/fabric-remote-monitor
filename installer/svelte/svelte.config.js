import sveltePreprocess from 'svelte-preprocess'

// export default {
//   // Consult https://github.com/sveltejs/svelte-preprocess
//   // for more information about preprocessors
//   preprocess: sveltePreprocess()
// }

const config = {
  preprocess: [sveltePreprocess({
    "postcss": true
  })]
};

export default config;
// Workaround until SvelteKit uses Vite 2.3.8 (and it's confirmed to fix the Tailwind JIT problem)
const mode = process.env.NODE_ENV;
const dev = mode === "development";
process.env.TAILWIND_MODE = dev ? "watch" : "build";
