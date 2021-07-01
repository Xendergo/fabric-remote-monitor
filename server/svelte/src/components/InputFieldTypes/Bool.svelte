<script lang="ts">
    import { send } from "../../networking"
    import type {
        AllowedInputFieldTypes,
        InputFieldClass,
    } from "../../../../networking/sendableTypesHelpers"

    export let field: InputFieldClass<AllowedInputFieldTypes>

    function onChange(e) {
        send(new field(e.target.checked))
    }
</script>

<input type="checkbox" on:change={onChange} />
