<script lang="ts">
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
    } from "../../../networking/sendableTypesHelpers"
    import String from "./InputFieldTypes/String.svelte"
    import Bool from "./InputFieldTypes/Bool.svelte"
    import Number from "./InputFieldTypes/Number.svelte"

    export let field: InputFieldClass<AllowedInputFieldTypes>
    let type = field.type()
</script>

{#if type == "string"}
    <String {field} />
{:else if type == "bool"}
    <Bool {field} />
{:else if type == "number"}
    <Number {field} />
{/if}
