import { strats } from "./defaultStrategies"

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
export abstract class ListenerManager<
    TransferringType extends Sendable,
    IOType
> {
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

        this.listeners
            .get(decoded.channel!)
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

/**
 * The names of the types allowed to be sent via an {@link InputFields} instance
 */
type AllowedInputFieldTypesNames = "string" | "bool" | "number"

/**
 * A generic representation of {@link InputFieldOptions}, used in the definition of {@link InputFieldsTypes}
 */
type InputFieldOptionsGeneric<T extends AllowedInputFieldTypesNames> = {
    type: T
}

/**
 * Options for how an input field looks and works
 */
export type InputFieldOptions =
    InputFieldOptionsGeneric<AllowedInputFieldTypesNames>

/**
 * The types allowed to be sent via an {@link InputFields} instance
 */
export type AllowedInputFieldTypes = string | boolean | number | null

/**
 * the different classes representing the different types allowed to be sent via an {@link InputFields} instance
 */
export type AllowedInputFieldClasses =
    | InputFieldClass<string | null>
    | InputFieldClass<boolean>
    | InputFieldClass<number | null>

/**
 * A [mapped type](www.typescriptlang.org/docs/handbook/2/mapped-types.html) used as a generic type constraint to improve type safety
 * Used to ensure that the interface inputted to {@link InputFields} doesn't use any types that can't be sent via an {@link InputFields} instance
 */
export type InputFieldsClassesConstraint<T> = {
    +readonly [Property in keyof T]: AllowedInputFieldTypes
}

/**
 * A [mapped type](www.typescriptlang.org/docs/handbook/2/mapped-types.html) that converts the interface inputted to {@link InputFields} to the fields argument of the {@link InputFields} constructor
 *
 * For example:
 * ```ts
 * interface example {
 *   str: string | null
 *   bool: boolean
 *   num: number | null
 * }
 *
 * type transformed = InputFieldsTypes<example>
 *
 * // converts to:
 * type transformed = {
 *   readonly str: InputFieldOptionsGeneric<"string">
 *   readonly bool: InputFieldOptionsGeneric<"bool">
 *   readonly num: InputFieldOptionsGeneric<"number">
 * }
 * ```
 */
type InputFieldsTypes<T extends InputFieldsClassesConstraint<T>> = {
    +readonly [Property in keyof T]: InputFieldOptionsGeneric<
        T[Property] extends string | null
            ? "string"
            : T[Property] extends boolean
            ? "bool"
            : T[Property] extends number | null
            ? "number"
            : never
    >
}

/**
 * A [mapped type](www.typescriptlang.org/docs/handbook/2/mapped-types.html) that converts an instance of {@link AllowedInputFieldTypes} to an instance of {@link AllowedInputFieldClasses} while still allowing type inference
 *
 * For example:
 * ```ts
 * interface example {
 *   str: string | null
 *   bool: boolean
 *   num: number | null
 * }
 *
 * type transformed = InputFieldsClasses<example>
 *
 * //converts to:
 * type transformed = {
 *   readonly str: InputFieldClass<string | null>
 *   readonly bool: InputFieldClass<boolean>
 *   readonly num: InputFieldClass<number | null>
 * }
 * ```
 */
export type InputFieldsClasses<T extends InputFieldsClassesConstraint<T>> = {
    +readonly [Property in keyof T]: Extract<
        InputFieldClass<T[Property]>,
        AllowedInputFieldClasses
    >
}

/**
 * A class generated by {@link generateClass} for {@link InputFields}, designed to be sent via regular `send` implementations
 */
export type InputFieldClass<T> = {
    channel(): string
    type(): AllowedInputFieldTypesNames
    new (value: T): { value: T; channel: string | undefined }
}

/**
 * Generates a class meant to be passed into a `send` function that represents a field in a {@link InputFields} instance
 * @param channel The channel the {@link InputFields} instance calling this is to be send through, combined with `key` to form a unique channel for this particular class
 * @param key The name of the field the class will be generated for
 * @param type The name of the type the class will be generated to send
 * @returns A class meant to be sent via regular `send` implementations to send a field in a {@link InputFields} instance
 */
function generateClass(
    channel: string,
    key: string,
    type: AllowedInputFieldTypesNames
) {
    let ret: InputFieldClass<any>
    if (type == "string") {
        @MakeSendable<NewClass>(`${channel}.${key}`, {
            value: strats.any<string | null>(strats.string, strats.null),
        })
        class NewClass extends Sendable {
            constructor(value: string | null) {
                super()
                this.value = value
            }

            static type() {
                return type
            }

            value: string | null
        }

        ret = NewClass
    } else if (type == "bool") {
        @MakeSendable<NewClass>(`${channel}.${key}`, {
            value: strats.boolean,
        })
        class NewClass extends Sendable {
            constructor(value: boolean) {
                super()
                this.value = value
            }

            static type() {
                return type
            }

            value: boolean
        }

        ret = NewClass
    } /*if (type == "number")*/ else {
        @MakeSendable<NewClass>(`${channel}.${key}`, {
            value: strats.any<number | null>(strats.number, strats.null),
        })
        class NewClass extends Sendable {
            constructor(value: number | null) {
                super()
                this.value = value
            }

            static type() {
                return type
            }

            value: number | null
        }

        ret = NewClass
    }

    return ret
}

function everythingGenerator<T extends InputFieldsClassesConstraint<T>>(
    channel: string
) {
    @MakeSendable<NewClass>(channel, {})
    class NewClass extends Sendable {
        [key: string]: AllowedInputFieldTypes | undefined

        constructor(values: T) {
            super()

            for (const key in values) {
                this[key as string] = values[key] as AllowedInputFieldTypes
            }
        }
    }

    return NewClass as unknown as {
        new (values: T): Sendable & T
        channel(): string
    }
}

function requestDefaultGenerator(channel: string) {
    @MakeSendable<NewClass>(`${channel}:default`, {})
    class NewClass extends Sendable {}

    return NewClass
}

function statusGenerator(channel: string) {
    @MakeSendable<NewClass>(`${channel}:Status`, {
        status: strats.any(strats.value("Error"), strats.value("Success")),
        text: strats.string,
    })
    class NewClass extends Sendable implements ResponseInterface {
        constructor(status: "Error" | "Success", text: string) {
            super()
            this.status = status
            this.text = text
        }

        status: "Error" | "Success"
        text: string
    }

    return NewClass
}

export interface ResponseInterface {
    status: "Error" | "Success"
    text: string
}

/**
 * A class representing a list of values, meant to make sending lots of unique values, specifically config menus on the client side, more convienient.
 *
 * It does this by taking an interface, and converting the interface's keys to a series of classes meant to be instantiated & sent via regular `send` implementations in a convenient & type safe way
 *
 * Meant to be instantiated in the global scope and reused, doing otherwise would cause a memory leak
 *
 * @typeParam `T` The interface of values that can be sent via the InputFields instance
 */
export class InputFields<T extends InputFieldsClassesConstraint<T>> {
    /**
     * @param channel The channel this InputField transfers data on
     * @param fields The data types of the values in type parameter `T`
     * @param submitAsEverything If this is set, send the entire input field through the Everything channel & use the text for the submit button
     */
    constructor(
        channel: string,
        fields: InputFieldsTypes<T>,
        submitAsEverything: string | null = null
    ) {
        this.fields = Object.entries(fields)
            .map(v => {
                const [key, value] = v as [string, InputFieldOptions]

                return [key, generateClass(channel, key, value.type)] as [
                    string,
                    InputFieldClass<AllowedInputFieldTypes>
                ]
            })
            .reduce<{ [key: string]: InputFieldClass<AllowedInputFieldTypes> }>(
                (a, v) => {
                    a[v[0]] = v[1]
                    return a
                },
                {}
            ) as InputFieldsClasses<T>

        this.fieldOptions = fields

        this.sendAsEverything = submitAsEverything

        this.Everything = everythingGenerator<T>(channel)
        this.RequestDefault = requestDefaultGenerator(channel)
        this.Status = statusGenerator(channel)
    }

    /**
     * A record of classes that can be passed into `send` implementations
     */
    fields: InputFieldsClasses<T>

    /**
     * If this is not null, then submit the data through Everything & use the text as the text for the submit button
     */
    sendAsEverything: string | null

    /**
     * A record of options for how the data should be presented & submitted
     */
    fieldOptions: InputFieldsTypes<T>

    /**
     * A class that can be passed into `send` implementations that allows for transferring all data in the InputFields instance
     */
    Everything: {
        new (values: T): Sendable & T
        channel(): string
    }

    /**
     * A class that can be passed into `send` implementations that should be sent when requesting default values, and the response should be sent on the `Everything` channel
     */
    RequestDefault: {
        new (): Sendable
        channel(): string
    }

    /**
     * A class that can be passed into `send` implementations that represent either an error or success message
     */
    Status: {
        new (status: "Error" | "Success", text: string): Sendable &
            ResponseInterface
        channel(): string
    }
}
