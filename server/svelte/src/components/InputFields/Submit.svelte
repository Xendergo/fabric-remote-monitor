<script lang="ts">
    import type { InputFieldsAsStores } from "src/inputFieldsToStoresConverter"

    export let inputFields: InputFieldsAsStores<any>
    export let data: object
    export let text: string
</script>

<button
    on:click={() => {
        inputFields.everything.set(data)
    }}>{text}</button
>
