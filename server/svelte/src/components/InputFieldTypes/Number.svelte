<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
    } from "../../../../networking/sendableTypesHelpers"

    export let field: InputFieldClass<AllowedInputFieldTypes>

    function onChange(e) {
        const value: string = e.target.value
        send(new field(value == "" ? null : parseFloat(value)))
    }
</script>

<input type="number" on:change={onChange} />
