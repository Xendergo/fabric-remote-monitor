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

<div>
    <table>
        {#each gamerules as gamerule}
            <tr>
                <th><p>{gamerule.name}</p></th>
                <th><input type="text" value={gamerule.default} /></th>
            </tr>
        {/each}
    </table>
</div>

<style>
    p {
        font-weight: normal;
    }

    table {
        border-collapse: collapse;
    }

    tr + tr th {
        border-top: 1px solid rgba(255, 255, 255, 0.5);
    }

    div {
        position: absolute;
        left: 0;
        width: 100vw;
        display: flex;
        justify-content: center;
    }
</style>
