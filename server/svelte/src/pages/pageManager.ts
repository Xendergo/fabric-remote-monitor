import { writable, Readable } from "svelte/store"

export enum Pages {
    Login,
    Home,
    Discord,
}

export const pages: Pages[] = [Pages.Home]
export const adminPages: Pages[] = [Pages.Discord]

const { subscribe, set } = writable<Pages>(Pages.Login)

export const page: Readable<Pages> = {
    subscribe,
}

export function changePage(newPage: Pages) {
    set(newPage)
}
