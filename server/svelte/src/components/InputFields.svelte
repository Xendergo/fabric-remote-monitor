<script lang="ts">
    import { listen, send, stopListening } from "../networking"

    import type {
        AllowedInputFieldTypes,
        InputFieldsInterface,
        ResponseInterface,
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
        currentValues = data
    }

    let responseMessage = ""
    let status: "Error" | "Success" = "Error"

    function onResponse(data: Sendable & ResponseInterface) {
        responseMessage = data.text
        status = data.status
    }

    listen(inputFields.Everything, onEverything)
    listen(inputFields.Response, onResponse)

    send(new inputFields.RequestDefault())

    onDestroy(() => {
        stopListening(inputFields.Everything, onEverything)
    })
</script>

{#each entries as [key, Field]}
    <InputField
        {Field}
        bind:value={currentValues[key]}
        fieldOptions={inputFields.fieldOptions[key]}
        label={inputFields.fieldOptions[key].customLabel ?? key}
    /><br />
{/each}
{#if inputFields.sendAsEverything}
    <button
        on:click={() => {
            send(new inputFields.Everything(currentValues))
        }}
    >
        {inputFields.sendAsEverything}
    </button>
{/if}
<p class:Error={status == "Error"} class:Success={status == "Success"}>
    {responseMessage}
</p>

<style>
    .Error {
        color: red;
    }

    .Success {
        color: rgb(0, 187, 0);
    }
</style>
