<script lang="ts">
    import Submit from "../components/InputFields/Submit.svelte"
    import { listenerManager, resetPasswordStores } from "../networking"
    import { resetPassword } from "../../../networking/sendableTypes"
    import type { ResetPassword } from "../../../networking/sendableTypes"
    import Response from "../components/InputFields/Response.svelte"
</script>

<input
    type="password"
    placeholder="Original password"
    bind:value={resetPasswordStores.localEverything.password}
/><br />
<input
    type="password"
    placeholder="New password"
    bind:value={resetPasswordStores.localEverything.newPassword}
/><br />
<Submit
    inputFields={resetPasswordStores}
    data={resetPasswordStores.localEverything}
    text="Reset password"
/>
<Response inputFields={resetPassword} {listenerManager} />
