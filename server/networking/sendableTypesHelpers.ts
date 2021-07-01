import { TagType } from "../mc-communication/nbt"

export abstract class Sendable {
    channel: string | undefined
}

export abstract class NbtSendable extends Sendable {
    abstract encode(): Map<string, TagType>
}

const nbtSendable: Map<string, (data: Map<string, TagType>) => NbtSendable> =
    new Map()

const sendableClasses: Map<string, { prototype: object }> = new Map()

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

export function parseNbtInput(data: Map<string, TagType>) {
    const parsedData = nbtSendable.get(data.get("channel") as string)!(data)

    Object.setPrototypeOf(
        parsedData,
        sendableClasses.get(parsedData.channel!)!.prototype
    )

    return parsedData
}

export function MakeSendable(channel: string) {
    return (constructor: {
        new (...args: any[]): Sendable
        channel(): string
    }) => {
        sendableClasses.set(channel, constructor)
        constructor.prototype.channel = channel
    }
}

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

export type AllowedInputFieldTypesNames = "string" | "bool" | "number"

export type AllowedInputFieldTypes = string | boolean | number | null

type AllowedInputFieldClasses =
    | InputFieldClass<string | null>
    | InputFieldClass<boolean>
    | InputFieldClass<number | null>

type InputFieldsTypes<T> = {
    +readonly [Property in keyof T]: T[Property] extends string | null
        ? "string"
        : T[Property] extends boolean
        ? "bool"
        : T[Property] extends number | null
        ? "number"
        : never
}

type InputFieldsClassesConstraint<T> = {
    +readonly [Property in keyof T]: AllowedInputFieldTypes
}

export type InputFieldsClasses<T extends InputFieldsClassesConstraint<T>> = {
    +readonly [Property in keyof T]: Extract<
        InputFieldClass<T[Property]>,
        AllowedInputFieldClasses
    >
}

export type InputFieldClass<T> = {
    channel(): string
    type(): AllowedInputFieldTypesNames
    new (value: T): { value: T; channel: string | undefined }
}

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

export class InputFields<T extends InputFieldsClassesConstraint<T>>
    implements InputFieldsInterface
{
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

    fields: InputFieldsClasses<T>
}

export interface InputFieldsInterface {
    fields: { [key: string]: AllowedInputFieldClasses }
}
