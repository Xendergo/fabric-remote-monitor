<script lang="ts">
    import { fade } from "svelte/transition"

    import { popups } from "../popupManager"

    export let title: string
    export let text: string

    const conf = {
        duration: 200,
    }
</script>

<div
    in:fade={conf}
    out:fade={conf}
    class="container"
    on:click={() => {
        popups.update(
            popupsToUpdate => (popupsToUpdate.shift(), popupsToUpdate)
        )
    }}
>
    <div
        class="message"
        on:click={e => {
            e.stopPropagation()
        }}
    >
        <h1>
            {title}
        </h1>
        <p>
            {text}
        </p>
    </div>
</div>

<style>
    * {
        background-color: transparent;
    }

    .container {
        width: 100vw;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        background-color: rgba(54, 0, 65, 0.377);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .message {
        width: 25vw;
        height: 25vh;
        border: 2px solid white;
        border-radius: 2vh;
        background-color: rgba(0, 0, 0, 0.25);
        filter: drop-shadow(5px 5px 4px black);
        text-align: center;
    }
</style>
