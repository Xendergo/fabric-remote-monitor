<script lang="ts">
    import { setAdmin, listen, send, stopListening } from "../networking"
    import {
        LoginDetails,
        LoginFailed,
        LoginSuccessful,
    } from "../../../networking/sendableTypes"
    import { onDestroy } from "svelte"
    import { changePage, Pages } from "./pageManager"

    let username: string
    let password: string

    function sendLoginDetails() {
        send(new LoginDetails(username, password))
    }

    let showErrorMessage = false

    function loginFailed() {
        showErrorMessage = true
    }

    function loginSuccessful(data: LoginSuccessful) {
        setAdmin(data.isAdmin)
        changePage(Pages.Home)
    }

    listen(LoginFailed, loginFailed)
    listen(LoginSuccessful, loginSuccessful)

    onDestroy(() => {
        stopListening(LoginFailed, loginFailed)
        stopListening(LoginSuccessful, loginSuccessful)
    })
</script>

<div>
    <input placeholder="username" bind:value={username} />
    <input type="password" placeholder="password" bind:value={password} />
    <button on:click={sendLoginDetails}>Log in</button>

    {#if showErrorMessage}
        <p>Your username or password was incorrect</p>
    {/if}
</div>

<style>
    div {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
    }

    p {
        color: red;
    }
</style>
