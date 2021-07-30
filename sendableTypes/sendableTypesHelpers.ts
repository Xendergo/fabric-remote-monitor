import type { Registry } from "./registry"

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
 * `finalize` is passed in the type checkers, and is responsible for type checking the data given to it wherever it needs to.
 * It must also faithfully convert the `IntermediateType` to the `TransferringType`.
 * Prototype changes are handled automatically
 * For example, if the IOType is JSON encoded text, and the IntermediateType is the return value of JSON.parse, then simply running the type checkers, throwing an error if they fail, and returning the same value is good enough.
 *
 * @typeParam `TransferringType` The data type that users of the implementing manager would receive and send
 * @typeParam `IntermediateType` The type that `decode` will decode to, and that `finalize` will convert from.
 * This is useful for being able to get a channel out of data, without decoding the data to it's final state.
 * That's useful for type checking data to make sure it *can* be decoded to it's final state before it is.
 * @typeParam `IOType` The data type that this manager converts `TransferringType` to and from, and is what's sent over the network
 */
export abstract class AbstractListenerManager<
    TransferringType extends Sendable,
    IntermediateType,
    IOType,
    TypeCheckingLayers extends Array<(data: any) => boolean>,
    CustomData = undefined
> implements ListenerManager<TransferringType>
{
    constructor(
        registry: Registry<TransferringType, TypeCheckingLayers, CustomData>
    ) {
        this.registry = registry
    }

    /**
     * Implementors must call this function when they receive data from the other end of the network
     * @param data The data received
     */
    protected onData(data: IOType) {
        let intermediate: IntermediateType
        let channel: any

        try {
            ;[channel, intermediate] = this.decode(data)
        } catch (e) {
            console.warn(
                `Dropped message because decoder threw an error: \n ${e} \n\n ${data}`
            )
            return
        }

        if (!(typeof channel === "string")) {
            console.warn(
                `Dropped message since \`channel\` is not a string: \n ${intermediate} \n\n ${data}`
            )

            return
        }

        if (!this.registry.entries.has(channel)) {
            console.warn(
                `Dropped message because it's channel (${channel}) isn't included in the registry (did you remember to use @MakeSendable on it?): \n ${intermediate} \n\n ${data}`
            )

            return
        }

        const [classType, strats, customData] =
            this.registry.entries.get(channel)!

        let decoded: TransferringType

        try {
            decoded = this.finalize(intermediate, strats, customData)
        } catch (e) {
            console.warn(
                `Dropped message because converting to the TransferringType failed: ${e}: \n ${intermediate} \n\n ${data}`
            )

            return
        }

        Object.setPrototypeOf(intermediate, classType.prototype)

        for (let i = 0; i < this.awaiters.length; i++) {
            const awaiter = this.awaiters[i]
            if (awaiter.channel === channel && awaiter.predicate(decoded)) {
                awaiter.resolve(decoded)

                this.awaiters.splice(i, 1)

                return
            }
        }

        this.listeners.get(channel)?.forEach(callback => callback(decoded))
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
        if (!this.registry.entries.has(data.channel!)) {
            throw new Error(
                "The class being sent isn't registered in the registry, did you remember to use @MakeSendable on it?"
            )
        }

        if (!this.isReady) {
            this.queue.push(data)
            return
        }

        data.channel = Object.getPrototypeOf(data).channel

        let encoded: IOType

        try {
            encoded = this.encode(data)
        } catch (e) {
            throw new Error(`The data being sent couldn't be encoded: ${e}`)
        }

        this.transmit(encoded)
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
     * Decode data from the `IOType` to the `IntermediateType`
     * @param data The data to decode
     */
    protected abstract decode(data: IOType): [any, IntermediateType]

    /**
     * Transmit data to the other side of the network connection
     * @param data The data to transmit
     */
    protected abstract transmit(data: IOType): void

    protected abstract finalize(
        data: IntermediateType,
        typeCheckingLayers: TypeCheckingLayers,
        customData: CustomData
    ): TransferringType

    private listeners: Map<string, Set<(data: TransferringType) => void>> =
        new Map()

    private awaiters: Array<Awaiter> = []

    private registry: Registry<TransferringType, TypeCheckingLayers, CustomData>
}

export type TypeCheckingStrategies<T extends Sendable> = Omit<
    {
        [Property in keyof T]-?: (data: any) => data is T[Property]
    },
    "channel"
>

/**
 * A decorator to make a class sendable via websockets
 * @param channel The channel this class should be sent through
 * @param strategies An object of strategies for type checking the values sent representing this class, in case someone sends invalid information to the server
 */
export function MakeSendable<
    T extends Sendable,
    TypeCheckingLayers extends Array<(data: any) => boolean>
>(
    registry: Registry<T, TypeCheckingLayers, undefined>,
    channel: string,
    strategies: TypeCheckingLayers
) {
    return MakeSendableWithData(registry, channel, strategies, undefined)
}

export function MakeSendableWithData<
    T extends Sendable,
    TypeCheckingLayers extends Array<(data: any) => boolean>,
    CustomData = undefined
>(
    registry: Registry<T, TypeCheckingLayers, CustomData>,
    channel: string,
    strategies: TypeCheckingLayers,
    customData: CustomData
) {
    return (constructor: { new (...args: any[]): T; channel(): string }) => {
        constructor.prototype.channel = channel

        registry.register(constructor, strategies, customData)
    }
}
