<script lang="ts">
    import { listen, send } from "../networking"
    import { MirrorMessage, newStyle } from "../../../networking/sendableTypes"

    let messages: MirrorMessage[] = []

    let message: string

    function sendMessage(e) {
        if (e.key !== "Enter") return

        send<MirrorMessage>(new MirrorMessage(message, newStyle({})))
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
            <p>{message.message}</p>
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
