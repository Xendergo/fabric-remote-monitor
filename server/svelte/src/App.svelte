<script lang="ts">
    import Login from "./pages/Login.svelte"
    import Home from "./pages/Home.svelte"
    import Discord from "./pages/Discord.svelte"
    import {
        pages,
        page,
        registerPage,
        unregisterAll,
    } from "./pages/pageManager"
    import Tabs from "./components/Tabs.svelte"
    import { fade } from "svelte/transition"
    import Account from "./pages/Account.svelte"
    import { popups } from "./popupManager"
    import Popup from "./components/Popup.svelte"
    import Gamerules from "./pages/Gamerules.svelte"
    import Info from "./pages/Info.svelte"
    import InfoEditor from "./pages/InfoEditor.svelte"
    import Features from "./pages/Features.svelte"
    import { githubLink } from "./networking"

    unregisterAll()

    // Note: Remember to change sendableTypes.ts when adding new pages
    registerPage("Login", Login, false, false)
    registerPage("Home", Home, false)
    registerPage("Info", Info, false)
    registerPage("Info Editor", InfoEditor, true)
    registerPage("Account", Account, false, true, false)
    registerPage("Discord", Discord, true)
    registerPage("Gamerules", Gamerules, true)
    registerPage("Features", Features, true)

    const conf = {
        duration: 200,
    }
</script>

<main>
    {#if $popups.length != 0}
        <Popup title={$popups[0].title} text={$popups[0].text} />
    {/if}

    {#if $pages[$page].visible}
        <Tabs />
    {/if}

    {#each $pages as RegisteredPage, i}
        {#if i === $page}
            <div
                in:fade={conf}
                out:fade={conf}
                class:notVisible={!RegisteredPage.visible}
            >
                <RegisteredPage.component />
            </div>
        {/if}
    {/each}

    {#if $githubLink}
        <a href={$githubLink} id="github-link" target="_blank">
            <img
                src="GitHub-Mark-120px-plus.png"
                id="github-image"
                alt="Link to github page"
            />
        </a>
    {/if}
</main>

<style>
    :global(*) {
        font-family: "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans",
            "Helvetica Neue", sans-serif;

        background-color: black;
        color: white;
        font-size: 1.4rem;
    }

    :global(.markdown *) {
        font-size: revert;
    }

    main {
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow-x: hidden;
    }

    div {
        position: absolute;
        top: calc(16px + 5vh);
        left: 8px;
    }

    #github-link {
        position: fixed;
        right: 2vh;
        bottom: 2vh;
    }

    #github-image {
        width: 4vh;
        height: 4vh;
        background-color: white;
        border-radius: 50%;
        outline: white solid 1px;
    }

    .notVisible {
        top: 0;
        left: 0;
    }

    :global(input),
    :global(button) {
        border: 2px solid white;
        background-color: transparent;
        padding: 8px;
        margin: 8px;
        border-radius: 8px;
        transition-duration: 0.2s;
        outline: none;
    }

    :global(button:hover) {
        cursor: pointer;
        background-color: #00ff0040;
    }
</style>
