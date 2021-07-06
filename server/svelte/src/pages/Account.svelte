<script lang="ts">
    import Submit from "../components/InputFields/Submit.svelte"
    import { listenerManager, resetPasswordStores } from "../networking"
    import { resetPassword } from "../../../networking/sendableTypes"
    import Response from "../components/InputFields/Response.svelte"

    const localEverything = resetPasswordStores.localEverything
</script>

<input
    type="password"
    placeholder="Original password"
    bind:value={$localEverything.password}
/><br />
<input
    type="password"
    placeholder="New password"
    bind:value={$localEverything.newPassword}
/><br />
<Submit
    inputFields={resetPasswordStores}
    data={$localEverything}
    text="Reset password"
/>
<Response inputFields={resetPassword} {listenerManager} />
