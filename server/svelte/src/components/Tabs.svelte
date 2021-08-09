<script lang="ts">
    import _ from "lodash"

    import {
        disableTabsStores,
        hideTabsStores,
        isAdmin,
        send,
    } from "../networking"
    import { disableTabs, hideTabs } from "../../../networking/sendableTypes"

    import {
        changePage,
        page as currentPage,
        pages,
    } from "../pages/pageManager"

    send(new hideTabs.RequestDefault())
    send(new disableTabs.RequestDefault())

    let hiddenTabs: { [key: string]: boolean }
    const hiddenTabsEverything = hideTabsStores.everything

    $: {
        $hiddenTabsEverything
        hiddenTabs = _.mapValues(hideTabsStores.fields, v => v.value)
    }

    let disabledTabs: { [key: string]: boolean }
    const disabledTabsEverything = disableTabsStores.everything

    $: {
        $disabledTabsEverything
        disabledTabs = _.mapValues(disableTabsStores.fields, v => v.value)
    }
</script>

<div class="box">
    {#each $pages as page, i}
        {#if page.visible && (!page.adminOnly || isAdmin) && (hiddenTabs[page.name] ?? true) && (disabledTabs[page.name] ?? true)}
            <div
                class="tab"
                class:currentPage={i == $currentPage}
                on:click={() => changePage(i)}
            >
                <p class:toDropShadow={i == $currentPage}>
                    {page.name}
                </p>
            </div>
        {/if}
    {/each}
</div>

<style>
    * {
        transition-duration: 0.2s;
    }

    .currentPage {
        background-color: #ff009d7e;
    }

    .box {
        display: flex;
        justify-content: flex-start;
        height: 5vh;
        border-bottom: 2px solid white;
        margin-bottom: 2vh;
    }

    .tab {
        flex: 1;
        max-width: 15vw;
        border-right: 2px solid white;
        text-align: center;
    }

    .toDropShadow {
        filter: drop-shadow(5px 5px 4px black);
    }

    .tab:hover {
        cursor: pointer;
    }

    p {
        margin: 0;
        background-color: transparent;
    }
</style>
