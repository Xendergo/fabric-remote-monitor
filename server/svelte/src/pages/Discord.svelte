<script lang="ts">
    import { discordInput } from "../../../networking/sendableTypes"
    import type { InputFieldsInterface } from "../../../networking/sendableTypesHelpers"

    import InputFields from "../components/InputFields.svelte"

    const input = discordInput as unknown as InputFieldsInterface
</script>

<InputFields inputFields={input} />
