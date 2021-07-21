/**
 * A class representing a class that can be sent via websockets
 * The `channel` field doesn't have to be overriden since the {@link MakeSendable} or {@link MakeNbtSendable} decorator will do that for you
 */
export abstract class Sendable {
    channel: string | undefined

    static channel() {
        return this.prototype.channel as string
    }
}

interface Awaiter {
    channel: string
    predicate: (data: Sendable) => boolean
    resolve: (data: Sendable) => void
}

/**
 * An interface to make dealing with unknown ListenerManagers easier
 *
 * Instead of implementing this interface, you'd probably have a nicer time implementing {@link AbstractListenerManager}
 *
 * @typeParam `TransferringType` The type of data you're allowed to send through this listener manager
 */
export interface ListenerManager<TransferringType extends Sendable> {
    /**
     * Listen for data sent by the other side of this connection, the data's prototype is also changed automatically so you get an actual instance of the class back
     * @param channelClass The class you're expecting to receive
     * @param callback Called when the listener manager received data on this channel
     */
    listen<T extends TransferringType>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: T) => void
    ): void

    /**
     * Stop listening for data on the other side of this connection
     * @param channelClass The class the callback expects to receive
     * @param callback The callback to unsubscribe
     */
    stopListening<T extends TransferringType>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: T) => void
    ): void

    /**
     * Send data to the other side of this connection
     * @param data The data to send
     */
    send<T extends TransferringType>(data: T): void

    /**
     * Returns a promise that gets resolved when message of the expected class gets received, allowing you to await messages from the other side of the connection
     *
     * Only one awaiter can receive a message
     * The priority of who gets what is decided by who called awaitMessage first
     * A message can't trigger listeners if it's captured by a call of awaitMessage
     *
     * @param channelClass The class representing the data you want to await
     * @param predicate Decides whether you want the promise to get resolved for the given channelClass
     * @returns A promise that gets resolved when a message comes in that matches the channelClass and predicate
     */
    awaitMessage<T extends TransferringType>(
        channelClass: { channel(): string; new (...data: any[]): T },
        predicate: (message: T) => boolean
    ): void
}

/**
 * A class to provide the common implementation details for classes managing communication using this API
 *
 * HOW TO IMPLEMENT:
 * You must call `this.onData` whenever the implementor received data from the other end of the connection
 *
 * You must call `this.ready` when the connection becomes open and you're ready to transmit data
 *
 * `encode` & `decode` only need to faithfully encode and decode the data given to it, everything else is handled by the ListenerManager class.
 * For example, if the `IOType` is json encoded text, just using `JSON.parse` & `JSON.stringify` would work just fine
 *
 * @typeParam `TransferringType` The data type that users of the implementing manager would receive and send
 * @typeParam `IOType` The data type that this manager converts `TransferringType` to and from, and is what's sent over the network
 */
export abstract class AbstractListenerManager<
    TransferringType extends Sendable,
    IOType
> implements ListenerManager<TransferringType>
{
    /**
     * Implementors must call this function when they receive data from the other end of the network
     * @param data The data received
     */
    protected onData(data: IOType) {
        let decoded: TransferringType

        try {
            decoded = this.decode(data)
        } catch (e) {
            console.warn(
                `Dropped message because decoder threw an error: \n ${e} \n\n ${data}`
            )
            return
        }

        if (!decoded.channel) {
            console.warn(
                `Dropped message for not having a channel: \n ${decoded} \n\n ${data}`
            )

            return
        }

        if (!sendableClasses.has(decoded.channel)) {
            console.warn(
                `Dropped message because it's channel (${decoded.channel}) isn't included in the registry (did you remember to use @MakeSendable on it?): \n ${decoded} \n\n ${data}`
            )

            return
        }

        const [prototype, strategies] = sendableClasses.get(decoded.channel)!

        for (const key in strategies) {
            if (!strategies[key]((decoded as { [key: string]: any })[key])) {
                console.warn(
                    `Dropped message because it failed the type check for key \`${key}\`: \n ${decoded} \n\n ${data}`
                )

                return
            }
        }

        Object.setPrototypeOf(decoded, prototype)

        for (let i = 0; i < this.awaiters.length; i++) {
            const awaiter = this.awaiters[i]
            if (
                awaiter.channel === decoded.channel &&
                awaiter.predicate(decoded)
            ) {
                awaiter.resolve(decoded)

                this.awaiters.splice(i, 1)

                return
            }
        }

        this.listeners
            .get(decoded.channel)
            ?.forEach(callback => callback(decoded))
    }

    /**
     * Listen for data sent by the other side of this connection, the data's prototype is also changed automatically so you get an actual instance of the class back
     * @param channelClass The class you're expecting to receive
     * @param callback Called when the listener manager received data on this channel
     */
    listen<T extends TransferringType>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: T) => void
    ) {
        const channel = channelClass.channel()

        if (!this.listeners.has(channel)) {
            this.listeners.set(channel, new Set())
        }

        this.listeners.get(channel)!.add(callback as any)
    }

    /**
     * Stop listening for data on the other side of this connection
     * @param channelClass The class the callback expects to receive
     * @param callback The callback to unsubscribe
     */
    stopListening<T extends TransferringType>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: T) => void
    ) {
        const channel = channelClass.channel()

        if (!this.listeners.has(channel)) return

        this.listeners.get(channel)!.delete(callback as any)
    }

    /**
     * Send data to the other side of the network
     * @param data The data to send
     */
    send<T extends TransferringType>(data: T) {
        if (!sendableClasses.has(data.channel!)) {
            throw new Error(
                "The class being sent isn't registered in the list of sendable classes, did you remember to use @MakeSendable on it?"
            )
        }

        if (!this.isReady) {
            this.queue.push(data)
            return
        }

        data.channel = Object.getPrototypeOf(data).channel

        this.transmit(this.encode(data))
    }

    /**
     * Returns a promise that gets resolved when message of the expected class gets received, allowing you to await messages from the other side of the connection
     *
     * Only one awaiter can receive a message
     * The priority of who gets what is decided by who called awaitMessage first
     * A message can't trigger listeners if it's captured by a call of awaitMessage
     *
     * @param channelClass The class representing the data you want to await
     * @param predicate Decides whether you want the promise to get resolved for the given channelClass
     * @returns A promise that gets resolved when a message comes in that matches the channelClass and predicate
     */
    awaitMessage<T extends TransferringType>(
        channelClass: { channel(): string; new (...data: any[]): T },
        predicate: (message: T) => boolean
    ) {
        return new Promise((resolve, reject) => {
            this.awaiters.push({
                channel: channelClass.channel(),
                predicate: predicate as unknown as (data: Sendable) => boolean,
                resolve: resolve,
            })
        })
    }

    private queue: Array<TransferringType> = []
    private isReady = false

    /**
     * Implementors must call this when the listener manager is ready to transmit data
     *
     * Before this is called, messages send by `send` are queued so they won't cause errors
     */
    protected ready() {
        this.isReady = true

        this.queue.forEach(v => this.send(v))

        this.queue = []
    }

    /**
     * Encode data from the `TransferringType` to the `IOType`
     * @param data The data to encode
     */
    protected abstract encode(data: TransferringType): IOType

    /**
     * Decode data from the `IOType` to the `TransferringType`
     * @param data The data to decode
     */
    protected abstract decode(data: IOType): TransferringType

    /**
     * Transmit data to the other side of the network connection
     * @param data The data to transmit
     */
    protected abstract transmit(data: IOType): void

    private listeners: Map<string, Set<(data: TransferringType) => void>> =
        new Map()

    private awaiters: Array<Awaiter> = []
}

export type TypeCheckingStrategies<T extends Sendable> = Omit<
    {
        [Property in keyof T]-?: (data: any) => data is T[Property]
    },
    "channel"
>

/**
 * All the classes that can be sent at all, used to change the prototype of decoded objects
 */
const sendableClasses: Map<
    string,
    [{ prototype: object }, { [key: string]: (data: any) => boolean }]
> = new Map()

/**
 * A decorator to make a class sendable via websockets
 * @param channel The channel this class should be sent through
 * @param strategies An object of strategies for type checking the values sent representing this class, in case someone sends invalid information to the server
 */
export function MakeSendable<T extends Sendable>(
    channel: string,
    strategies: TypeCheckingStrategies<T>
) {
    return (constructor: { new (...args: any[]): T; channel(): string }) => {
        sendableClasses.set(channel, [constructor, strategies])
        constructor.prototype.channel = channel
    }
}
