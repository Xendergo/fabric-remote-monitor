<script lang="ts">
    import { send } from "../networking"
    import { LoginDetails } from "../../../networking/sendableTypes"

    let username: string
    let password: string

    function sendLoginDetails() {
        send<LoginDetails>(new LoginDetails(username, password))
    }
</script>

<input placeholder="username" bind:value={username} />
<input type="password" placeholder="password" bind:value={password} />
<button on:click={sendLoginDetails}>Submit</button>
