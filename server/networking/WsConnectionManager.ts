import ws from "ws"
import { connectedUsers } from ".."
import { Sendable, sendableClasses } from "./sendableTypes"
import { ConnectedUser } from "./ConnectedUser"

export class WsConnectionManager {
    constructor(socket: ws, user: ConnectedUser) {
        this.socket = socket

        this.socket.onmessage = e => {
            const data: Sendable = JSON.parse(e.data as string)

            Object.setPrototypeOf(
                data,
                sendableClasses.get(data.channel!)!.prototype
            )

            this.listeners
                .get(data.channel!)
                ?.forEach(callback => callback(data))
        }

        this.socket.onclose = e => {
            connectedUsers.delete(user)
        }
    }

    listen<T extends Sendable>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: T) => void
    ) {
        const channel = channelClass.channel()

        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set())
        }

        this.listeners.get(channel)!.add(callback as any)
    }

    stopListening<T extends Sendable>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: Sendable) => void
    ) {
        const channel = channelClass.channel()
        if (!this.listeners.has(channel)) return

        this.listeners.get(channel)!.delete(callback)
    }

    send<T extends Sendable>(dataObj: T) {
        let data = dataObj as { [key: string]: any }

        data.channel = Object.getPrototypeOf(dataObj).channel

        this.socket.send(JSON.stringify(data))
    }

    socket: ws
    listeners: Map<string, Set<(data: Sendable) => void>> = new Map()
}

export function broadcast<T extends Sendable>(dataObj: T) {
    connectedUsers.forEach(user => {
        user.connectionManager.send<T>(dataObj)
    })
}
