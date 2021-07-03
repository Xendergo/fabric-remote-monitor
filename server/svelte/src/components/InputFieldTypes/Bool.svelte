<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
        InputFieldOptions,
    } from "../../../../networking/sendableTypesHelpers"

    export let fieldOptions: InputFieldOptions
    export let Field: InputFieldClass<AllowedInputFieldTypes>
    export let value: boolean = false
    export let label: string

    function onChange(e) {
        if (fieldOptions.buttonSubmit) return
        send(new Field(e.target.checked))
    }
</script>

<input type="checkbox" on:change={onChange} bind:checked={value} />
