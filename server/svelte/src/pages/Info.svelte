<script lang="ts">
    import { listen, send, stopListening } from "../networking"
    import { CurrentPages, Pages } from "../../../networking/sendableTypes"
    import type { Page } from "../../../networking/sendableTypes"
    import { onDestroy } from "svelte"
    import DOMPurify from "dompurify"
    import marked from "marked"
    import { fade } from "svelte/transition"

    let pages: Map<number, Page> = new Map()

    send(new CurrentPages())

    function onPages(newPages: Pages) {
        pages = newPages.getPages()
        console.log(pages)
    }

    listen(Pages, onPages)

    onDestroy(() => {
        stopListening(Pages, onPages)
    })

    let currentPage: number | null = null

    const conf = {
        duration: 200,
    }
</script>

<div class="container">
    <div class="tabs">
        {#each Array.from(pages.entries()).sort((a, b) => a[1].ordinal - b[1].ordinal) as [key, page]}
            <p
                on:click={() => {
                    currentPage = key
                }}
            >
                {page.title}
            </p>
        {/each}
    </div>

    {#if currentPage === null}
        {#if pages.size === 0}
            Your server's admins haven't put anything on this page
        {/if}
    {:else if pages.has(currentPage)}
        <div in:fade={conf} out:fade={conf}>
            {@html DOMPurify.sanitize(
                marked((pages.get(currentPage) ?? { data: "" }).data)
            )}
        </div>
    {/if}
</div>

<style>
    .container {
        display: flex;
        width: 98vw;
        height: 92vh;
        align-items: stretch;
        margin: 0;
    }

    .tabs {
        display: inline grid;
        border: 2px solid white;
        border-radius: 4px;
        margin-right: 16px;
        padding: 8px;
        grid-template-rows: repeat(auto-fill, calc(1.4rem + 16px));
    }

    p {
        margin: 0;
    }

    p:hover {
        cursor: pointer;
    }
</style>
