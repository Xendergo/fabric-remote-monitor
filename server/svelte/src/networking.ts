import {
    parseInput,
    Sendable,
    ListenerManager,
} from "../../networking/sendableTypesHelpers"

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
    }

    encode(dataObj: Sendable) {
        let data = dataObj as { [key: string]: any }

        data.channel = Object.getPrototypeOf(dataObj).channel

        return JSON.stringify(data)
    }

    decode(data: string) {
        return parseInput(data)
    }

    transmit(data: string) {
        this.ws.send(data)
    }

    ws
}

const clientConnectionManager = new ClientConnectionManager()

export function listen<T extends Sendable>(
    channelClass: { channel(): string; new (...data: any[]): T },
    callback: (data: T) => void
) {
    clientConnectionManager.listen(channelClass, callback)
}

export function stopListening<T extends Sendable>(
    channelClass: { channel(): string; new (...data: any[]): T },
    callback: (data: Sendable) => void
) {
    clientConnectionManager.stopListening(channelClass, callback)
}

export function send<T extends Sendable>(data: T) {
    clientConnectionManager.send(data)
}
