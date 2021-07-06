import ws from "ws"
import { connectedUsers } from ".."
import {
    ListenerManager,
    Sendable,
} from "../../sendableTypes/sendableTypesHelpers"
import { ConnectedUser } from "./ConnectedUser"

export class WsConnectionManager extends ListenerManager<Sendable, string> {
    constructor(socket: ws, user: ConnectedUser) {
        super()
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

    protected decode(data: string) {
        return JSON.parse(data)
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
