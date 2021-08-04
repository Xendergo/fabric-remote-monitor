import {
    InternalListenerManager,
    Registry,
    Sendable,
    MakeSendable,
} from "triangulum"

const serverStateRegistry = new Registry<Sendable, []>()

class ServerStateManager extends InternalListenerManager {
    constructor() {
        super(serverStateRegistry)
        this.ready()
    }

    transmit(data: Sendable) {
        this.onData(data)
    }
}

export const serverStateManager = new ServerStateManager()

export function MakeServerStateSendable(channel: string) {
    return MakeSendable(serverStateRegistry, channel, [])
}
