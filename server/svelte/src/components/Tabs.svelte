<script lang="ts">
    import { isAdmin } from "../networking"

    import {
        adminPages,
        changePage,
        page as currentPage,
        Pages,
        pages,
    } from "../pages/pageManager"
</script>

<div class="box">
    {#each isAdmin ? pages.concat(adminPages) : pages as page}
        <div
            class="tab"
            class:currentPage={page == $currentPage}
            on:click={() => changePage(page)}
        >
            <p class:toDropShadow={page == $currentPage}>
                {Pages[page]}
            </p>
        </div>
    {/each}
</div>

<style>
    * {
        transition-duration: 0.2s;
    }

    .currentPage {
        background-color: #ff009d7e;
    }

    .box {
        display: flex;
        justify-content: flex-start;
        height: 5vh;
        border-bottom: 2px solid white;
        margin-bottom: 2vh;
    }

    .tab {
        flex: 1;
        max-width: 15vw;
        border-right: 2px solid white;
        text-align: center;
    }

    .toDropShadow {
        filter: drop-shadow(5px 5px 4px black);
    }

    .tab:hover {
        cursor: pointer;
    }

    p {
        margin: 0;
        background-color: transparent;
    }
</style>
