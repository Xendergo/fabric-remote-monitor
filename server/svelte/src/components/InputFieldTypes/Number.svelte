<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
        InputFieldOptions,
    } from "../../../../networking/sendableTypesHelpers"

    export let fieldOptions: InputFieldOptions
    export let Field: InputFieldClass<AllowedInputFieldTypes>
    export let value: number | null = null
    export let label: string

    let elemValue

    $: {
        elemValue = value?.toString() ?? ""
    }

    function onChange(e) {
        const newValue: string = e.target.value
        value = newValue == "" ? null : parseFloat(newValue)
        if (fieldOptions.buttonSubmit) return
        send(new Field(value))
    }
</script>

<input
    type="number"
    on:change={onChange}
    bind:value={elemValue}
    placeholder={fieldOptions.placeholderLabel ? label : ""}
/>
