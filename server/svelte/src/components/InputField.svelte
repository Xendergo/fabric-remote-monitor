<script lang="ts">
    import type {
        AllowedInputFieldClasses,
        AllowedInputFieldTypes,
    } from "../../../networking/sendableTypesHelpers"
    import String from "./InputFieldTypes/String.svelte"
    import Bool from "./InputFieldTypes/Bool.svelte"
    import Number from "./InputFieldTypes/Number.svelte"

    export let Field: AllowedInputFieldClasses
    let type = Field.type()

    export let value
</script>

{#if type == "string"}
    <String {Field} bind:value />
{:else if type == "bool"}
    <Bool {Field} bind:value />
{:else if type == "number"}
    <Number {Field} bind:value />
{/if}
