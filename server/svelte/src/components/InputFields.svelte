<script lang="ts">
    import { listen, send, stopListening } from "../networking"

    import type {
        AllowedInputFieldTypes,
        InputFieldsInterface,
        Sendable,
    } from "../../../networking/sendableTypesHelpers"
    import InputField from "./InputField.svelte"
    import { onDestroy } from "svelte"

    export let inputFields: InputFieldsInterface

    let entries = Object.entries(inputFields.fields)

    let currentValues: { [key: string]: AllowedInputFieldTypes } = {}

    function onEverything(
        data: Sendable & { [key: string]: AllowedInputFieldTypes }
    ) {
        console.log(data)
        currentValues = data
    }

    listen(inputFields.Everything, onEverything)

    send(new inputFields.RequestDefault())

    onDestroy(() => {
        stopListening(inputFields.Everything, onEverything)
    })
</script>

{#each entries as [key, Field]}
    {key} - <InputField {Field} bind:value={currentValues[key]} />
{/each}
