<script lang="ts">
    import { onDestroy } from "svelte"

    import type {
        InputFields,
        ListenerManager,
        ResponseInterface,
        Sendable,
    } from "../../../../networking/sendableTypesHelpers"

    export let inputFields: InputFields<any>
    export let listenerManager: ListenerManager<Sendable, any>

    let status = "Error"
    let text = ""

    function onResponse(data: ResponseInterface) {
        status = data.status
        text = data.text
    }

    listenerManager.listen(inputFields.Response, onResponse)

    onDestroy(() => {
        listenerManager.stopListening(inputFields.Response, onResponse)
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
