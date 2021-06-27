import { writable, Readable } from "svelte/store"

type pages = "login" | "home"

const { subscribe, set } = writable<pages>("login")

export const page: Readable<pages> = {
    subscribe,
}

export function changePage(newPage: pages) {
    set(newPage)
}
