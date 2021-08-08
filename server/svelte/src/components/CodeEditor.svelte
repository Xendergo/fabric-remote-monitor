<script lang="ts">
    import hljs from "highlight.js/lib/common"
    import { onMount } from "svelte"

    import xml from "highlight.js/lib/languages/xml"
    import md from "highlight.js/lib/languages/markdown"
    import yaml from "highlight.js/lib/languages/yaml"
    import json from "highlight.js/lib/languages/json"

    hljs.registerLanguage("xml", xml)
    hljs.registerLanguage("md", md)
    hljs.registerLanguage("yaml", yaml)
    hljs.registerLanguage("json", json)

    // Credit for concept: https://css-tricks.com/creating-an-editable-textarea-that-supports-syntax-highlighted-code/

    export let language: string | undefined | null
    export let spellcheck = false
    export let onChange: (newText: string) => void = () => {}

    export let text = ""

    $: {
        if (code !== undefined) {
            onValueChange()
            text
        }
    }

    let code: HTMLElement
    let textarea: HTMLTextAreaElement

    function syncScroll() {
        code.scrollTop = textarea.scrollTop
        code.scrollLeft = textarea.scrollLeft
    }

    function onValueChange() {
        onChange(text)

        const newText = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;")

        code.innerHTML = newText.replaceAll(/\r{0}\n/g, "\r\n")

        hljs.highlightElement(code)

        syncScroll()
    }
</script>

<div class="container">
    <textarea
        {spellcheck}
        bind:this={textarea}
        bind:value={text}
        on:input={onValueChange}
        on:scroll={() => {
            syncScroll()
        }}
    />

    <pre>
    <code
        bind:this={code}
        class={language ? `language-${language}` : ""}
    /></pre>
</div>

<style>
    code,
    textarea {
        font-family: "ubuntu mono", Consolas, "Courier New", monospace;
        font-size: 1rem;

        padding: 8px;
        width: calc(100% - 20px);
        height: calc(100% - 20px);
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 8px;
        line-height: 1rem;

        overflow: auto;
    }

    :global(code *) {
        font-family: "ubuntu mono", Consolas, "Courier New", monospace !important;
        font-size: 1rem !important;
        line-height: 1rem;
        background-color: transparent;
    }

    :global(pre code.hljs) {
        background-color: black;
        padding: 8px;
    }

    code {
        border: 2px solid white;
        z-index: 0;
    }

    pre {
        margin: 0;
    }

    textarea {
        position: absolute;
        background-color: transparent;
        color: transparent;
        border: none;
        z-index: 1;

        color: transparent;
        background: transparent;
        caret-color: white;

        resize: none;
    }

    .container {
        position: relative;
        width: 100%;
        height: 100%;
    }
</style>
