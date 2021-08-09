<script lang="ts">
    import { disableTabs } from "../../../networking/sendableTypes"
    import type { DisableTabs } from "../../../networking/sendableTypes"
    import { pages as pagesStore } from "./pageManager"
    import { disableTabsStores, isAdmin, send } from "../networking"

    let pagesDerefed = $pagesStore
    const disableTabsEverything = disableTabsStores.everything

    send(new disableTabs.RequestDefault())

    let keys: (keyof DisableTabs)[] = []

    $: updateKeys($disableTabsEverything)

    function updateKeys(hideTabsEverything: DisableTabs) {
        keys = Object.keys(hideTabsEverything).filter(
            name =>
                isAdmin || !pagesDerefed.find(v => v.name === name)?.adminOnly
        ) as (keyof DisableTabs)[]
    }
</script>

<h3>Disable features</h3>
{#each keys as key}
    {key} -
    <input
        type="checkbox"
        bind:checked={disableTabsStores.fields[key].value}
    /><br />
{/each}
