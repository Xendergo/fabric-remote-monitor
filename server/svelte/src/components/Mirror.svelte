<script lang="ts">
    import { listen, send, stopListening } from "../networking"
    import { MirrorMessage, newStyle } from "../../../networking/sendableTypes"
    import { obfuscatedText } from "../obfuscatedTextProvider"
    import { onDestroy } from "svelte"
    import type { Readable } from "svelte/store"

    let messages: MirrorMessage[] = []

    let message: string

    function sendMessage(e) {
        if (e.key !== "Enter") return

        send<MirrorMessage>(new MirrorMessage(message, newStyle({})))
        message = ""
    }

    const unsubscribe: (() => void)[] = []

    function onMirrorMessage(msg: MirrorMessage) {
        console.log(
            msg.style.color,
            msg.style.color
                .map(v => v.toString(16).padEnd(2, "0"))
                .reduce((a, v) => a + v)
        )

        messages = [...messages, msg]

        if (msg.style.obfuscated) {
            const store = obfuscatedText(msg.message)
            const index = messages.length - 1

            unsubscribe.push(
                store.subscribe(v => {
                    messages[index].message = v
                })
            )
        }
    }

    listen(MirrorMessage, onMirrorMessage)

    onDestroy(() => {
        stopListening(MirrorMessage, onMirrorMessage)
        unsubscribe.forEach(v => v())
    })
</script>

<div class="mirrorContainer">
    <div>
        {#each messages as message}
            <p
                style="
                color: #{message.style.color
                    .map(v => v.toString(16))
                    .reduce((a, v) => a + v)};
                font-weight: {message.style.bold ? 'bold' : 'normal'};
                font-style: {message.style.italic ? 'italic' : 'normal'};
                text-decoration: {message.style.underlined
                    ? 'underline'
                    : message.style.strikethrough
                    ? 'line-through'
                    : 'none'}
            "
            >
                {message.message}
            </p>
        {/each}
    </div>
    <input
        placeholder="Send a message"
        on:keypress={sendMessage}
        bind:value={message}
    />
</div>

<style>
    .mirrorContainer {
        height: 80vh;
        width: 30vw;
        border: 2px solid white;
        border-radius: 1vh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .mirrorContainer div {
        overflow-y: scroll;
    }
    p {
        font-size: 1rem;
        font-family: "ubuntu mono", Consolas, "Courier New", monospace;
        margin-top: 16px;
        margin-bottom: 0px;
        margin-left: 8px;
    }

    input {
        margin: 0;
        border: none;
        border-top: 2px solid white;
        font-family: "ubuntu mono", Consolas, "Courier New", monospace;
    }
</style>
