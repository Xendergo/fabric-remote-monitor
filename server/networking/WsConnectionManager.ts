import ws from "ws"
import { connectedUsers } from ".."
import {
    AbstractListenerManager,
    Sendable,
} from "../../sendableTypes/sendableTypesHelpers"
import { ConnectedUser } from "./ConnectedUser"
import { websiteRegistry } from "./sendableTypes"

export class WsConnectionManager extends AbstractListenerManager<
    Sendable,
    object,
    string,
    [(data: any) => boolean]
> {
    constructor(socket: ws, user: ConnectedUser) {
        super(websiteRegistry)

        this.ready()

        this.socket = socket

        this.socket.onmessage = e => {
            this.onData(e.data as string)
        }

        this.socket.onclose = e => {
            connectedUsers.delete(user)
        }
    }

    protected encode(dataObj: Sendable) {
        return JSON.stringify(dataObj)
    }

    protected decode(data: string): [any, object] {
        let parsed = JSON.parse(data)

        return [parsed.channel, parsed]
    }

    protected transmit(data: string) {
        this.socket.send(data)
    }

    protected finalize(data: any, checkers: [(data: any) => boolean]) {
        if (!checkers[0](data)) {
            throw new Error(`Type checking failed`)
        }

        return data
    }

    socket: ws
}

export function broadcast<T extends Sendable>(dataObj: T) {
    connectedUsers.forEach(user => {
        user.connectionManager.send<T>(dataObj)
    })
}
