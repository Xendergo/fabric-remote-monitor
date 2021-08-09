<script lang="ts">
    import Submit from "../components/InputFields/Submit.svelte"
    import {
        listenerManager,
        resetPasswordStores,
        hideTabsStores,
        isAdmin,
        send,
        disableTabsStores,
    } from "../networking"
    import { hideTabs, resetPassword } from "../../../networking/sendableTypes"
    import type { HideTabs } from "../../../networking/sendableTypes"
    import Response from "../components/InputFields/Response.svelte"
    import { pages as pagesStore } from "./pageManager"
    import _ from "lodash"

    let pagesDerefed = $pagesStore

    const resetPasswordEverything = resetPasswordStores.localEverything
    const hideTabsEverything = hideTabsStores.everything

    send(new hideTabs.RequestDefault())

    let keys: (keyof HideTabs)[] = []

    $: updateKeys($hideTabsEverything)

    function updateKeys(hideTabsEverything: HideTabs) {
        keys = Object.keys(hideTabsEverything).filter(
            name =>
                isAdmin || !pagesDerefed.find(v => v.name === name)?.adminOnly
        ) as (keyof HideTabs)[]
    }

    let disabledTabs: { [key: string]: boolean }
    const disabledTabsEverything = disableTabsStores.everything

    $: {
        $disabledTabsEverything
        disabledTabs = _.mapValues(disableTabsStores.fields, v => v.value)
    }
</script>

<h3>Reset password</h3>
<input
    type="password"
    placeholder="Original password"
    bind:value={$resetPasswordEverything.password}
/><br />
<input
    type="password"
    placeholder="New password"
    bind:value={$resetPasswordEverything.newPassword}
/><br />
<Submit
    inputFields={resetPasswordStores}
    data={$resetPasswordEverything}
    text="Reset password"
/>
<Response inputFields={resetPassword} {listenerManager} />
<h3>Hide tabs</h3>
{#each keys as key}
    {#if disabledTabs[key] ?? true}
        {key} -
        <input
            type="checkbox"
            bind:checked={hideTabsStores.fields[key].value}
        /><br />
    {/if}
{/each}
