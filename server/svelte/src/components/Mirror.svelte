<script lang="ts">
    import { listen, send } from "../networking"
    import {
        ClientMirrorMessage,
        MirrorMessage,
    } from "../../../networking/sendableTypes"

    interface message {
        author: string
        message: string
    }

    let messages: message[] = [
        {
            author: "Xendergo",
            message: "Poggers?",
        },
        {
            author: "Xendergo",
            message: "Poggers.",
        },
    ]

    let message: string

    function sendMessage(e) {
        if (e.key !== "Enter") return

        send<ClientMirrorMessage>(new ClientMirrorMessage(message))
        message = ""
    }

    function onMirrorMessage(msg: MirrorMessage) {
        messages = [...messages, msg]
    }

    listen(MirrorMessage, onMirrorMessage)
</script>

<div class="mirrorContainer">
    <div>
        {#each messages as message}
            <p>{"<"}{message.author}> {message.message}</p>
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
