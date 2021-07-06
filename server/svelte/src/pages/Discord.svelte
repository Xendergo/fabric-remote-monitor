<script lang="ts">
    import { discordInputStores } from "../networking"

    const token = discordInputStores.fields.token
</script>

<input placeholder="Discord bot token" bind:value={$token} />
