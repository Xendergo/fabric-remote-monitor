<script lang="ts">
    import { onDestroy } from "svelte"

    import type {
        ListenerManager,
        Sendable,
    } from "../../../../../sendableTypes/sendableTypesHelpers"

    import type {
        InputFields,
        ResponseInterface,
    } from "../../../../../sendableTypes/inputFields"

    export let inputFields: InputFields<any>
    export let listenerManager: ListenerManager<Sendable>

    let status = "Error"
    let text = ""

    function onStatus(data: ResponseInterface) {
        status = data.status
        text = data.text
    }

    listenerManager.listen(inputFields.Status, onStatus)

    onDestroy(() => {
        listenerManager.stopListening(inputFields.Status, onStatus)
    })
</script>

<p class:error={status == "Error"} class:success={status == "Success"}>
    {text}
</p>

<style>
    .error {
        color: red;
    }

    .success {
        color: limegreen;
    }
</style>
