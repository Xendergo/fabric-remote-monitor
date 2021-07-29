import { writable, Readable } from "svelte/store"

export enum Pages {
    Login,
    Home,
    Discord,
    Account,
    Gamerules,
}

export const pages: Pages[] = [Pages.Home, Pages.Account]
export const adminPages: Pages[] = [Pages.Discord, Pages.Gamerules]

const { subscribe, set } = writable<Pages>(Pages.Login)

export const page: Readable<Pages> = {
    subscribe,
}

export function changePage(newPage: Pages) {
    set(newPage)
}
