import { resetPassword, discordInput } from "../../networking/sendableTypes"
import { InputFieldsAsStores } from "./inputFieldsToStoresConverter"
import {
    Sendable,
    ListenerManager,
} from "../../../sendableTypes/sendableTypesHelpers"

export let isAdmin = false

export function setAdmin(newAdmin: boolean) {
    isAdmin = newAdmin
}

class ClientConnectionManager extends ListenerManager<Sendable, string> {
    constructor() {
        super()

        this.ws = new WebSocket(`ws://${location.host}/ws`)

        this.ws.onmessage = e => {
            this.onData(e.data as string)
        }

        this.ws.onopen = e => {
            this.ready()
        }
    }

    encode(dataObj: Sendable) {
        return JSON.stringify(dataObj)
    }

    decode(data: string) {
        return JSON.parse(data)
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
