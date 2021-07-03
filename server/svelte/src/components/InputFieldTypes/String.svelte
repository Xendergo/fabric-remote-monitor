<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
        InputFieldOptions,
    } from "../../../../networking/sendableTypesHelpers"

    export let fieldOptions: InputFieldOptions
    export let Field: InputFieldClass<AllowedInputFieldTypes>
    export let value: string | null = null
    export let label: string

    let elemValue

    $: {
        elemValue = value?.toString() ?? ""
    }

    function onChange(e) {
        const newValue: string = e.target.value
        value = newValue == "" ? null : newValue
        if (fieldOptions.buttonSubmit) return
        send(new Field(value))
    }
</script>

{#if fieldOptions.confidential}
    <input
        on:change={onChange}
        bind:value={elemValue}
        placeholder={fieldOptions.placeholderLabel ? label : ""}
        type="password"
    />
{:else}
    <input
        on:change={onChange}
        bind:value={elemValue}
        placeholder={fieldOptions.placeholderLabel ? label : ""}
    />
{/if}
