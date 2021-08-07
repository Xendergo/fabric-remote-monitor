<script lang="ts">
    import { listen, send, stopListening } from "../networking"
    import { CurrentPages, Pages } from "../../../networking/sendableTypes"
    import type { Page } from "../../../networking/sendableTypes"
    import { onDestroy } from "svelte"
    import CodeEditor from "../components/CodeEditor.svelte"
    import DOMPurify from "dompurify"
    import marked from "marked"

    let pages: Map<number, Page> = new Map()

    send(new CurrentPages())

    function onPages(newPages: Pages) {
        pages = newPages.getPages()
    }

    listen(Pages, onPages)

    onDestroy(() => {
        stopListening(Pages, onPages)
    })

    let currentPage: number | null = null

    let text = ""

    $: updateText(currentPage ?? -1)

    function updateText(currentPage: number) {
        text = (pages.get(currentPage ?? -1) ?? { data: "" }).data
    }
</script>

<div class="container">
    <div class="tabs">
        {#each Array.from(pages.entries()).sort((a, b) => a[1].ordinal - b[1].ordinal) as [key, page]}
            <p
                on:click={() => {
                    currentPage = key
                }}
                class:selected={currentPage === key}
            >
                {page.title}
            </p>
        {/each}
    </div>

    {#if currentPage !== null && pages.has(currentPage)}
        <div class="editor">
            <div class="editorContainer">
                <CodeEditor bind:text language="markdown" />
                <a
                    href="https://www.markdownguide.org/cheat-sheet/"
                    alt="How to use markdown"
                    target="_blank">?</a
                >
            </div>
            <div class="markdown">
                {@html DOMPurify.sanitize(marked(text))}
            </div>
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
        /* padding: 8px; */
        grid-template-rows: repeat(auto-fill, calc(1.4rem + 16px));
    }

    .editor {
        width: 100%;
        display: flex;
    }

    .editorContainer {
        margin-right: 32px;
        width: 50%;
        height: calc(92vh - 16px);
    }

    .selected {
        filter: drop-shadow(2px 2px 4px #ff009d);
    }

    p {
        margin: 0px;
        padding: 8px;
        background-color: transparent;
    }

    p:hover {
        cursor: pointer;
    }

    a {
        float: inline-end;
        position: relative;
        top: -1.6rem;
        left: 0.3rem;
        text-decoration: none;
        border: 2px solid white;
        border-radius: 50%;
        height: 1.7rem;
        width: 1.7rem;
        text-align: center;
        z-index: 100;
    }
</style>
