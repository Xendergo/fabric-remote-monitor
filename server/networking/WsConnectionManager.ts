import ws from "ws"
import { connectedUsers } from ".."
import { JSONListenerManager, Sendable } from "triangulum"
import { ConnectedUser } from "./ConnectedUser"
import { websiteRegistry } from "./sendableTypes"

export class WsConnectionManager extends JSONListenerManager {
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
