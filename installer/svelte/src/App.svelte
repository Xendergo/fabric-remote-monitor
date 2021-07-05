<script lang="ts">
    import Form from "./lib/Form.svelte"
    import Question from "./lib/Question.svelte"

    const keysdown = new Set()
    window.addEventListener("keypress", ev => {
        keysdown.add(ev.key)
    })
</script>

<!-- Setup -->
<main class="flex" />

<style style lang="postcss">
    :global(html) {
        @apply h-screen w-full;
    }
    :global(body #app) {
        @apply h-screen w-full;
    }
    main {
        @apply h-full w-full;
    }
</style>
