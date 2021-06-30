import { parseInput, Sendable } from "../../networking/sendableTypesHelpers"

const listeners: Map<string, Set<(data: Sendable) => void>> = new Map()

const ws = new WebSocket(`ws://${location.host}/ws`)

export let isAdmin = false

export function setAdmin(newAdmin: boolean) {
    isAdmin = newAdmin
}

ws.onmessage = e => {
    const data = parseInput(e.data as string)

    listeners.get(data.channel)?.forEach(listener => {
        listener(data)
    })
}

export function listen<T extends Sendable>(
    channelClass: { channel(): string; new (...data: any[]): T },
    callback: (data: T) => void
) {
    const channel = channelClass.channel()

    if (!listeners.has(channel)) {
        listeners.set(channel, new Set())
    }

    listeners.get(channel).add(callback)
}

export function stopListening<T extends Sendable>(
    channelClass: { channel(): string; new (...data: any[]): T },
    callback: (data: T) => void
) {
    const channel = channelClass.channel()

    if (!listeners.has(channel)) return

    listeners.get(channel).delete(callback)
}

export function send<T extends Sendable>(dataObj: T) {
    let data = dataObj as { [key: string]: any }

    data.channel = Object.getPrototypeOf(dataObj).channel

    ws.send(JSON.stringify(dataObj))
}
