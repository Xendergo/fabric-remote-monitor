import ws from 'ws';
import { Sendable } from './sendableTypes';

export class WsConnectionManager {
    constructor(socket: ws) {
        this.socket = socket

        this.socket.onmessage = (e) => {
            const data: Sendable = JSON.parse(e.data as string)

            this.listeners.get(data.channel)?.forEach(callback => callback(data))
        }
    }

    listen<T extends Sendable>(channel: string, callback: (data: T) => void) {
        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set())
        }
    
        this.listeners.get(channel)!.add(callback as any)
    }
    
    stopListening(channel: string, callback: (data: Sendable) => void) {
        if (!this.listeners.has(channel)) return
        
        this.listeners.get(channel)!.delete(callback)
    }
    
    send<T extends Sendable>(dataObj: T) {
        const data = dataObj as {[k: string]: any}
    
        data.channel = dataObj.channel

        this.socket.send(JSON.stringify(data))
    }

    socket: ws
    listeners: Map<string, Set<(data: Sendable) => void>> = new Map()
}