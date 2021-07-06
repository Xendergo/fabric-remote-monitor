<script lang="ts">
    import { discordInput } from "../../../networking/sendableTypes"
    import { discordInputStores, send } from "../networking"

    send(new discordInput.RequestDefault())
    const token = discordInputStores.fields.token
</script>

<input type="password" placeholder="Discord bot token" bind:value={$token} />
