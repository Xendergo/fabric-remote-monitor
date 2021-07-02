<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
    } from "../../../../networking/sendableTypesHelpers"

    export let Field: InputFieldClass<AllowedInputFieldTypes>
    export let value: boolean = false

    function onChange(e) {
        send(new Field(e.target.checked))
    }
</script>

<input type="checkbox" on:change={onChange} bind:checked={value} />
