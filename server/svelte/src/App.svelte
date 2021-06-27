<script lang="ts">
    import Login from "./pages/Login.svelte"
    import Home from "./pages/Home.svelte"
    import { page } from "./pages/pageManager"
</script>

<main>
    {#if $page == "login"}
        <Login />
    {:else if $page == "home"}
        <Home />
    {/if}
</main>

<style>
    :global(*) {
        font-family: "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
            "Helvetica Neue", sans-serif;

        background-color: black;
        color: white;
        font-size: 1.4rem;
    }

    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }

    :global(input),
    :global(button) {
        border: 2px solid white;
        background-color: transparent;
        padding: 8px;
        margin: 8px;
        border-radius: 8px;
        transition-duration: 0.2s;
        outline: none;
    }

    :global(button:hover) {
        cursor: pointer;
        background-color: #00ff0040;
    }
</style>
