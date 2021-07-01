<script lang="ts">
    import type { InputFieldsInterface } from "../../../networking/sendableTypesHelpers"
    import InputField from "./InputField.svelte"

    export let inputFields: InputFieldsInterface

    let entries = Object.entries(inputFields.fields)
</script>

{#each entries as [key, field]}
    {key} - <InputField {field} />
{/each}
