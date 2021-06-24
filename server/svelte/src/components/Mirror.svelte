<script lang="ts">
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
</script>

<div>
    {#each messages as message}
        <p>{"<"}{message.author}> {message.message}</p>
    {/each}
</div>

<style>
    div {
        height: 80vh;
        width: 30vw;
        border: 2px solid white;
        border-radius: 1vh;
    }
</style>
