<script lang="ts">
    import Submit from "../components/InputFields/Submit.svelte"
    import { listenerManager, resetPasswordStores } from "../networking"
    import { resetPassword } from "../../../networking/sendableTypes"
    import type { ResetPassword } from "../../../networking/sendableTypes"
    import Response from "../components/InputFields/Response.svelte"

    let data: ResetPassword = {
        password: "",
        newPassword: "",
    }
</script>

<input
    type="password"
    placeholder="Original password"
    bind:value={data.password}
/><br />
<input
    type="password"
    placeholder="New password"
    bind:value={data.newPassword}
/><br />
<Submit inputFields={resetPasswordStores} {data} text="Reset password" />
<Response inputFields={resetPassword} {listenerManager} />
