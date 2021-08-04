<script lang="ts">
    import { listen, send, stopListening } from "../networking"
    import {
        Gamerules,
        DefaultGamerules,
        ChangeGamerule,
    } from "../../../networking/sendableTypes"
    import type { Gamerule } from "../../../networking/sendableTypes"
    import { onDestroy } from "svelte"

    let gamerules: Gamerule[] = []

    let inputs: HTMLInputElement[] = []

    function onDefaultGamerules(data: Gamerules) {
        console.log(data)
        gamerules = data.gamerules
    }

    function onChangeGamerule(changedGamerule: ChangeGamerule) {
        for (let i = 0; i < gamerules.length; i++) {
            if (gamerules[i].name === changedGamerule.gamerule) {
                gamerules[i].default = changedGamerule.value

                inputs[i].value = changedGamerule.value

                break
            }
        }
    }

    listen(Gamerules, onDefaultGamerules)
    listen(ChangeGamerule, onChangeGamerule)

    onDestroy(() => {
        stopListening(Gamerules, onDefaultGamerules)
        stopListening(ChangeGamerule, onChangeGamerule)
    })

    send(new DefaultGamerules())

    function gameruleChanged(gamerule: Gamerule) {
        return function (
            event: Event & { currentTarget: EventTarget & HTMLInputElement }
        ) {
            const newValue = event.currentTarget.value

            send(new ChangeGamerule(gamerule.name, newValue))
        }
    }
</script>

<div>
    <table>
        {#each gamerules as gamerule, i}
            <tr>
                <th><p>{gamerule.name}</p></th>
                <th
                    ><input
                        type="text"
                        value={gamerule.default}
                        on:change={gameruleChanged(gamerule)}
                        bind:this={inputs[i]}
                    /></th
                >
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
