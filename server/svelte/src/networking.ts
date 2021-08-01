import {
    resetPassword,
    discordInput,
    websiteRegistry,
} from "../../networking/sendableTypes"
import { InputFieldsAsStores } from "./inputFieldsToStoresConverter"
import { Sendable, AbstractListenerManager } from "triangulum"

export let isAdmin = false

export function setAdmin(newAdmin: boolean) {
    isAdmin = newAdmin
}

class ClientConnectionManager extends AbstractListenerManager<
    Sendable,
    object,
    string,
    [(data: any) => boolean]
> {
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

    encode(dataObj: Sendable) {
        return JSON.stringify(dataObj)
    }

    decode(data: string): [string, object] {
        const parsed = JSON.parse(data)

        return [parsed.channel, parsed]
    }

    transmit(data: string) {
        this.ws.send(data)
    }

    finalize(data: object, typeCheckers: [(data: any) => boolean]) {
        if (!typeCheckers[0](data)) {
            throw new Error("Type checking failed")
        }

        return data as Sendable
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
