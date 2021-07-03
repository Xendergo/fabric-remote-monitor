import ws from "ws"
import { connectedUsers } from ".."
import { ListenerManager, parseInput, Sendable } from "./sendableTypesHelpers"
import { ConnectedUser } from "./ConnectedUser"

export class WsConnectionManager extends ListenerManager<Sendable, string> {
    constructor(socket: ws, user: ConnectedUser) {
        super()

        this.socket = socket

        this.socket.onmessage = e => {
            this.onData(e.data as string)
        }

        this.socket.onclose = e => {
            connectedUsers.delete(user)
        }
    }

    protected encode(dataObj: Sendable) {
        let data = dataObj as { [key: string]: any }

        data.channel = Object.getPrototypeOf(dataObj).channel

        return JSON.stringify(data)
    }

    protected decode(data: string) {
        return parseInput(data)
    }

    protected transmit(data: string) {
        this.socket.send(data)
    }

    socket: ws
}

export function broadcast<T extends Sendable>(dataObj: T) {
    connectedUsers.forEach(user => {
        user.connectionManager.send<T>(dataObj)
    })
}
