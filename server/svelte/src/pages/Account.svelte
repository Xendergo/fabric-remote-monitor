<script lang="ts">
    import { resetPassword } from "../../../networking/sendableTypes"
    import type { InputFieldsInterface } from "../../../networking/sendableTypesHelpers"

    import InputFields from "../components/InputFields.svelte"

    const resetPasswordConverted =
        resetPassword as unknown as InputFieldsInterface
</script>

<InputFields inputFields={resetPasswordConverted} />
