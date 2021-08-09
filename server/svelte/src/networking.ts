import {
    resetPassword,
    discordInput,
    websiteRegistry,
} from "../../networking/sendableTypes"
import { InputFieldsAsStores } from "./inputFieldsToStoresConverter"
import { Sendable, JSONListenerManager } from "triangulum"
import { hideTabs, HideTabs } from "../../networking/sendableTypes"

export let isAdmin = false

export function setAdmin(newAdmin: boolean) {
    isAdmin = newAdmin
}

class ClientConnectionManager extends JSONListenerManager {
    constructor() {
        super(websiteRegistry)

        this.ws = new WebSocket(`ws://${location.host}/ws`)

        this.ws.onmessage = e => {
            this.onData(e.data as string)
        }

        this.ws.onopen = e => {
            this.ready()
        }
    }

    transmit(data: string) {
        this.ws.send(data)
    }

    ws
}

export const listenerManager = new ClientConnectionManager()

export const resetPasswordStores = new InputFieldsAsStores(
    resetPassword,
    listenerManager
)

export const discordInputStores = new InputFieldsAsStores(
    discordInput,
    listenerManager
)

export const hideTabsStores = new InputFieldsAsStores<HideTabs>(
    hideTabs,
    listenerManager
)

export function listen<T extends Sendable>(
    channelClass: { channel(): string; new (...data: any[]): T },
    callback: (data: T) => void
) {
    listenerManager.listen(channelClass, callback)
}

export function stopListening<T extends Sendable>(
    channelClass: { channel(): string; new (...data: any[]): T },
    callback: (data: T) => void
) {
    listenerManager.stopListening(channelClass, callback)
}

export function send<T extends Sendable>(data: T) {
    listenerManager.send(data)
}
