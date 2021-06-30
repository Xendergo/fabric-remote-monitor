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

type AllowedInputFieldTypes = "string" | "bool" | "number"

type InputFieldsTypes<T> = {
    +readonly [Property in keyof T]: AllowedInputFieldTypes
}

type InputFieldsClasses<T> = {
    +readonly [Property in keyof T]: AllowedInputFieldTypes
}

type InputFieldClass<T> = {
    channel(): string
    new (value: T): { value: T }
}

function generateClass(
    channel: string,
    key: string,
    type: AllowedInputFieldTypes
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

            value: number | null
        }
    }

    ret.prototype.channel = `${channel}.${key}`

    return ret
}

export class InputFields<T> {
    constructor(channel: string, fields: InputFieldsTypes<T>) {
        this.fields = Object.entries(fields)
            .map(v => {
                const [key, value] = v as [string, AllowedInputFieldTypes]

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
            ) as unknown as InputFieldsClasses<T>
    }

    fields: InputFieldsClasses<T>
}

interface DiscordInput {
    token: string | null
}

export const discordInput = new InputFields<DiscordInput>("DiscordInput", {
    token: "string",
})
