<script lang="ts">
    import { listen, send } from "../networking"

    import type {
        AllowedInputFieldTypes,
        InputFieldsInterface,
    } from "../../../networking/sendableTypesHelpers"
    import InputField from "./InputField.svelte"

    export let inputFields: InputFieldsInterface

    send(new inputFields.RequestDefault())

    let entries = Object.entries(inputFields.fields)

    let currentValues: { [key: string]: AllowedInputFieldTypes } = {}

    listen(inputFields.Everything, data => {
        currentValues = data
    })
</script>

{#each entries as [key, Field]}
    {key} - <InputField {Field} bind:value={currentValues[key]} />
{/each}
