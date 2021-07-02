<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
    } from "../../../../networking/sendableTypesHelpers"

    export let Field: InputFieldClass<AllowedInputFieldTypes>

    export let value: string | null = null

    let elemValue

    $: {
        elemValue = value?.toString() ?? ""
    }

    function onChange(e) {
        const newValue: string = e.target.value
        value = newValue == "" ? null : newValue
        send(new Field(value))
    }
</script>

<input on:change={onChange} bind:value={elemValue} />
