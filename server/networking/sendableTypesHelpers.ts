import { TagType } from "../mc-communication/nbt"

/**
 * A class representing a class that can be sent via websockets
 * The `channel` field doesn't have to be overriden since the {@link MakeSendable} or {@link MakeNbtSendable} decorator will do that for you
 */
export abstract class Sendable {
    channel: string | undefined
}

/**
 * A class representing a class that can be sent via websockets or NBT
 */
export abstract class NbtSendable extends Sendable {
    /**
     * Encode this class as an NBT compound
     */
    abstract encode(): Map<string, TagType>
}

/**
 * All the classes that can be sent via NBT, used to find the decoder of a particular channel
 */
const nbtSendable: Map<string, (data: Map<string, TagType>) => NbtSendable> =
    new Map()

/**
 * All the classes that can be sent at all, used to change the prototype of decoded objects
 */
const sendableClasses: Map<string, { prototype: object }> = new Map()

/**
 * Parse input encoded as JSON into a class
 * @param data JSON encoded object
 * @returns An object, if the channel is in sendableClasses, it'll also change the prototype so you can use the class's methods on it
 */
export function parseInput(data: string) {
    const parsedData: Sendable = JSON.parse(data)

    if (sendableClasses.has(parsedData.channel!)) {
        Object.setPrototypeOf(
            parsedData,
            sendableClasses.get(parsedData.channel!)!.prototype
        )
    }

    return parsedData
}

/**
 *
 * @param data An NBT compound
 * @returns An object with the prototype changed to the one degsignated by the channel
 */
export function parseNbtInput(data: Map<string, TagType>) {
    const parsedData = nbtSendable.get(data.get("channel") as string)!(data)

    Object.setPrototypeOf(
        parsedData,
        sendableClasses.get(parsedData.channel!)!.prototype
    )

    return parsedData
}

/**
 * A decorator to make a class sendable via websockets
 * @param channel The channel this class should be sent through
 */
export function MakeSendable(channel: string) {
    return (constructor: {
        new (...args: any[]): Sendable
        channel(): string
    }) => {
        sendableClasses.set(channel, constructor)
        constructor.prototype.channel = channel
    }
}

/**
 * A decorator to make a class sendable via NBT or websockets
 * @param channel The channel this class should be send through
 * @param decode A function to decode an NBT compound to the class
 */
export function MakeNbtSendable<T extends NbtSendable>(
    channel: string,
    decode: (data: Map<string, TagType>) => T
) {
    return (constructor: {
        new (...args: any[]): NbtSendable
        channel(): string
    }) => {
        sendableClasses.set(channel, constructor)
        nbtSendable.set(channel, decode)
        constructor.prototype.channel = channel
    }
}

/**
 * The names of the types allowed to be sent via an {@link InputFields} instance
 */
type AllowedInputFieldTypesNames = "string" | "bool" | "number"

/**
 * The types allowed to be sent via an {@link InputFields} instance
 */
type AllowedInputFieldTypes = string | boolean | number | null

/**
 * the different classes representing the different types allowed to be sent via an {@link InputFields} instance
 */
type AllowedInputFieldClasses =
    | InputFieldClass<string | null>
    | InputFieldClass<boolean>
    | InputFieldClass<number | null>

/**
 * A mapped type used as a generic type constraint to improve type safety
 * Used to ensure that the interface inputted to {@link InputFields} doesn't use any types that can't be sent via an {@link InputFields} instance
 */
type InputFieldsClassesConstraint<T> = {
    +readonly [Property in keyof T]: AllowedInputFieldTypes
}

/**
 * A mapped type that converts the interface inputted to {@link InputFields} to the fields argument of the {@link InputFields} constructor
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
 *   readonly str: "string"
 *   readonly bool: "bool"
 *   readonly num: "number"
 * }
 * ```
 */
type InputFieldsTypes<T extends InputFieldsClassesConstraint<T>> = {
    +readonly [Property in keyof T]: T[Property] extends string | null
        ? "string"
        : T[Property] extends boolean
        ? "bool"
        : T[Property] extends number | null
        ? "number"
        : never
}

/**
 * A mapped type that converts an instance of {@link AllowedInputFieldTypes} to an instance of {@link AllowedInputFieldClasses} while still allowing type inference
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
        ret = class extends Sendable {
            constructor(value: string | null) {
                super()
                this.value = value
            }

            static channel() {
                return this.prototype.channel as string
            }

            static type() {
                return type
            }

            value: string | null
        }
    } else if (type == "bool") {
        ret = class extends Sendable {
            constructor(value: boolean) {
                super()
                this.value = value
            }

            static channel() {
                return this.prototype.channel as string
            }

            static type() {
                return type
            }

            value: boolean
        }
    } /*if (type == "number")*/ else {
        ret = class extends Sendable {
            constructor(value: number | null) {
                super()
                this.value = value
            }

            static channel() {
                return this.prototype.channel as string
            }

            static type() {
                return type
            }

            value: number | null
        }
    }

    ret.prototype.channel = `${channel}.${key}`

    return ret
}

/**
 * A class representing a list of values, meant to make sending lots of unique values, specifically config menus on the client side, more convienient.
 *
 * It does this by taking an interface, and converting the interface's keys to a series of classes meant to be instantiated & sent via regular `send` implementations in a convenient & type safe way
 *
 * @typeParam T The interface of values that can be sent via the InputFields instance
 */
export class InputFields<T extends InputFieldsClassesConstraint<T>>
    implements InputFieldsInterface
{
    /**
     * @param channel The channel this InputField transfers data on
     * @param fields The data types of the values in type parameter `T`
     */
    constructor(channel: string, fields: InputFieldsTypes<T>) {
        this.fields = Object.entries(fields)
            .map(v => {
                const [key, value] = v as [string, AllowedInputFieldTypesNames]

                return [key, generateClass(channel, key, value)] as [
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
    }

    /**
     * A record of classes that can be passed into `send` implementations
     */
    fields: InputFieldsClasses<T>
}

/**
 * An interface implemented by {@link InputFields} to make dealing with the `fields` field programmatically easier
 */
export interface InputFieldsInterface {
    fields: { [key: string]: AllowedInputFieldClasses }
}
