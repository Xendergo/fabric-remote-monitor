<script lang="ts">
    import { listen, send, stopListening } from "../networking"
    import {
        CurrentPages,
        DeletePage,
        Pages,
    } from "../../../networking/sendableTypes"
    import type { Page } from "../../../networking/sendableTypes"
    import { hasContext, onDestroy } from "svelte"
    import CodeEditor from "../components/CodeEditor.svelte"
    import DOMPurify from "dompurify"
    import marked from "marked"

    let pages: Map<number, Page> = new Map()

    send(new CurrentPages())

    function onPages(newPages: Pages) {
        pages = newPages.getPages()

        stopListening(Pages, onPages)
    }

    listen(Pages, onPages)

    onDestroy(() => {
        stopListening(Pages, onPages)

        send(
            new Pages(
                Array.from(pages.entries()).reduce<(Page & { id: number })[]>(
                    (a, v) => {
                        a.push({
                            id: v[0],
                            title: v[1].title,
                            data: v[1].data,
                            ordinal: v[1].ordinal,
                        })

                        return a
                    },
                    []
                )
            )
        )
    })

    let currentPage: number | null = null

    let text = ""

    $: updateText(currentPage ?? -1)

    let currentName = ""

    function updateText(currentPage: number) {
        const page = pages.get(currentPage ?? -1) ?? { data: "", title: "" }
        text = page.data
        currentName = page.title
    }

    function updatePage(callback: (page: Page) => Page) {
        if (currentPage === null) return

        const page = pages.get(currentPage)

        if (!page) return

        const updatedPage = callback(page)

        pages.set(currentPage, updatedPage)

        pages = pages
    }
</script>

<div class="container">
    <div class="tabs">
        <div id="tabs-flex">
            {#each Array.from(pages.entries()).sort((a, b) => a[1].ordinal - b[1].ordinal) as [key, page]}
                <p
                    on:click={() => {
                        currentPage = key
                    }}
                    class:selected={currentPage === key}
                >
                    {page.title}
                </p>
                <button
                    alt="Delete page"
                    on:click={() => {
                        if (
                            confirm(
                                "Are you sure you want to delete this page?"
                            )
                        ) {
                            pages.delete(key)

                            send(new DeletePage(key))

                            pages = pages
                        }
                    }}><span class="shrink-text">🗑️</span></button
                >
            {/each}
        </div>
        <button
            id="newButton"
            on:click={() => {
                for (var i = 0; pages.has(i); i++) {}

                const ordinal = Math.max(
                    ...Array.from(pages.values()).map(v => v.ordinal)
                )

                pages.set(i, {
                    ordinal: ordinal,
                    data: "",
                    title: "New Page",
                })

                pages = pages
            }}
            alt="New page"><span>+</span></button
        >
    </div>

    {#if currentPage !== null && pages.has(currentPage)}
        <div class="editorContainer">
            <input
                id="name-changer"
                bind:value={currentName}
                on:input={() => {
                    updatePage(page => {
                        page.title = currentName
                        return page
                    })
                }}
            />
            <div id="codeEditorContainer">
                <CodeEditor
                    bind:text
                    language="markdown"
                    onChange={newText => {
                        updatePage(page => {
                            page.data = newText
                            return page
                        })
                    }}
                />
                <a
                    href="https://www.markdownguide.org/cheat-sheet/"
                    alt="How to use markdown"
                    target="_blank"
                    id="questionButton">?</a
                >
            </div>
        </div>
        <div class="markdown">
            {@html DOMPurify.sanitize(marked(text))}
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
        display: flex;
        flex-direction: column;
        border: 2px solid white;
        border-radius: 4px;
        margin-right: 16px;
        flex: initial;
    }

    #tabs-flex {
        grid-template-rows: repeat(auto-fill, calc(1.4rem + 16px));
        grid-template-columns: auto auto;
        display: inline grid;
        flex: 1;
    }

    .editorContainer {
        margin-right: 32px;
        flex: 1;
        height: calc(94vh - 16px);
        display: flex;
        flex-direction: column;
    }

    #codeEditorContainer {
        flex: 1;
    }

    #name-changer {
        width: calc(100% - 20px);
        margin: 0;
        margin-bottom: 8px;
        flex: initial;
    }

    .shrink-text {
        font-size: 0.9rem;
    }

    .markdown {
        flex: 1;
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

    #questionButton {
        float: inline-end;
        top: -2.5rem;
        left: -0.7rem;
    }

    #newButton {
        display: block;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 16px;
        flex: initial;
    }

    a,
    button {
        position: relative;
        text-decoration: none;
        border: 2px solid white;
        border-radius: 50%;
        height: 1.7rem;
        width: 1.7rem;
        text-align: center;
        z-index: 100;
    }

    button span {
        display: block;
        height: 100%;
        width: 100%;
        text-align: center;
        padding: 0;
        line-height: 0.7rem;
        background-color: transparent;
    }
</style>
