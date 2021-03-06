import { writable, Readable, Writable } from "svelte/store"

interface RegisteredPage {
    name: string
    component: any
    adminOnly: boolean
    visible: boolean
    hideable: boolean
}

const writablePages: Writable<RegisteredPage[]> = writable([])

export const pages: Readable<RegisteredPage[]> = {
    subscribe: writablePages.subscribe,
}

const { subscribe, set } = writable<number>(0)

export const page: Readable<number> = {
    subscribe,
}

export function changePage(newPage: number) {
    set(newPage)
}

export function registerPage(
    name: string,
    component: any,
    adminOnly: boolean,
    visible: boolean = true,
    hideable: boolean = true
) {
    writablePages.update(v => {
        v.push({
            name,
            component,
            adminOnly,
            visible,
            hideable,
        })

        return v
    })
}

export function unregisterAll() {
    writablePages.set([])
}
