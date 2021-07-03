<script lang="ts">
    import type {
        AllowedInputFieldClasses,
        InputFieldOptions,
    } from "../../../networking/sendableTypesHelpers"
    import String from "./InputFieldTypes/String.svelte"
    import Bool from "./InputFieldTypes/Bool.svelte"
    import Number from "./InputFieldTypes/Number.svelte"

    export let fieldOptions: InputFieldOptions
    export let Field: AllowedInputFieldClasses
    export let label: string
    let type = Field.type()

    export let value
</script>

{#if !fieldOptions.placeholderLabel}
    {label} -
{/if}
{#if type == "string"}
    <String {Field} bind:value {fieldOptions} {label} />
{:else if type == "bool"}
    <Bool {Field} bind:value {fieldOptions} {label} />
{:else if type == "number"}
    <Number {Field} bind:value {fieldOptions} {label} />
{/if}
