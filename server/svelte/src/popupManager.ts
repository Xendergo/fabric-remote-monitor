import { listen } from "./networking"
import { Popup } from "../../networking/sendableTypes"
import { writable } from "svelte/store"

listen(Popup, data => {
    popups.update(popupsToChange => [...popupsToChange, data])
})

export let popups = writable<Popup[]>([])
