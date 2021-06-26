<script lang="ts">
    import Login from "./components/Login.svelte"
</script>

<main>
    <Login />
</main>

<style>
    * {
        font-family: "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
            "Helvetica Neue", sans-serif;

        background-color: black;
        color: white;
    }

    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
    }
</style>
