<script lang="ts">
    import { listen, send, stopListening } from "../networking"
    import {
        Gamerules,
        DefaultGamerules,
    } from "../../../networking/sendableTypes"
    import type { Gamerule } from "../../../networking/sendableTypes"
    import { onDestroy } from "svelte"

    let gamerules: Gamerule[] = []

    function onDefaultGamerules(data: Gamerules) {
        console.log(data)
        gamerules = data.gamerules
    }

    listen(Gamerules, onDefaultGamerules)

    onDestroy(() => {
        stopListening(Gamerules, onDefaultGamerules)
    })

    send(new DefaultGamerules())
</script>

{#each gamerules as gamerule}
    {gamerule.name} - <input type="text" value={gamerule.default} /><br />
{/each}
