import { int, TagType } from "../mc-communication/nbt"
import {
    MakeSendable,
    Sendable,
    TypeCheckingStrategies,
} from "../../sendableTypes/sendableTypesHelpers"
import { strats } from "../../sendableTypes/defaultStrategies"
import { InputFields } from "../../sendableTypes/inputFields"

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
export const nbtSendable: Map<
    string,
    (data: Map<string, TagType>) => NbtSendable
> = new Map()

/**
 *
 * @param data An NBT compound
 * @returns An object with the prototype changed to the one degsignated by the channel
 */
export function parseNbtInput(data: Map<string, TagType>) {
    return nbtSendable.get(data.get("channel") as string)!(data)
}

/**
 * A decorator to make a class sendable via NBT or websockets
 * @param channel The channel this class should be send through
 * @param decode A function to decode an NBT compound to the class
 */
export function MakeNbtSendable<T extends NbtSendable>(
    channel: string,
    theseStrats: Omit<TypeCheckingStrategies<T>, "encode">,
    decode: (data: Map<string, TagType>) => T
) {
    return (constructor: { new (...args: any[]): T; channel(): string }) => {
        const theseConvertedStrats = theseStrats as TypeCheckingStrategies<T>

        theseConvertedStrats.encode = strats.isPrototype()

        MakeSendable<T>(channel, theseConvertedStrats)(constructor)
        nbtSendable.set(channel, decode)
    }
}

@MakeSendable<LoginDetails>("LoginDetails", {
    username: strats.string,
    password: strats.string,
})
export class LoginDetails extends Sendable {
    constructor(username: string, password: string) {
        super()
        this.username = username
        this.password = password
    }

    username: string
    password: string
}

@MakeNbtSendable<SignupDetails>(
    "SignupDetails",
    {
        username: strats.string,
        password: strats.string,
    },
    data => {
        return new SignupDetails(
            data.get("username")! as string,
            data.get("password")! as string
        )
    }
)
export class SignupDetails extends NbtSendable {
    constructor(username: string, password: string) {
        super()
        this.username = username
        this.password = password
    }

    username: string
    password: string

    encode() {
        return new Map(Object.entries(this))
    }
}

@MakeSendable("LoginFailed", {})
export class LoginFailed extends Sendable {}

@MakeSendable<LoginSuccessful>("LoginSuccessful", {
    isAdmin: strats.boolean,
})
export class LoginSuccessful extends Sendable {
    constructor(isAdmin: boolean) {
        super()
        this.isAdmin = isAdmin
    }

    isAdmin: boolean
}

@MakeNbtSendable(
    "MirrorMessage",
    {
        message: strats.string,
        style: function (data: any): data is Style {
            return true
        },
    },
    data => {
        const style = (data.get("style")! as int).value

        return new MirrorMessage(data.get("message")! as string, {
            color: [
                (Number(style) & 0xff000000) >>> 24,
                (Number(style) & 0x00ff0000) >>> 16,
                (Number(style) & 0x0000ff00) >>> 8,
            ],
            bold: (style & 1n) != 0n,
            italic: (style & 2n) != 0n,
            underlined: (style & 4n) != 0n,
            strikethrough: (style & 8n) != 0n,
            obfuscated: (style & 16n) != 0n,
        })
    }
)
export class MirrorMessage extends NbtSendable {
    constructor(message: string, style: Style) {
        super()
        this.message = message
        this.style = style
    }

    message
    style

    encode() {
        const ret: Map<string, TagType> = new Map()
        ret.set("message", this.message)

        let flags = 0n
        flags |= this.style.bold ? 1n : 0n
        flags |= this.style.italic ? 2n : 0n
        flags |= this.style.underlined ? 4n : 0n
        flags |= this.style.strikethrough ? 8n : 0n
        flags |= this.style.obfuscated ? 16n : 0n
        flags |= (BigInt(this.style.color[2]) & 255n) << 8n
        flags |= (BigInt(this.style.color[1]) & 255n) << 16n
        flags |= (BigInt(this.style.color[0]) & 255n) << 24n

        ret.set("style", {
            type: "int",
            value: flags,
        })

        return ret
    }
}

export function newStyle(style: PartialStyle): Style {
    return {
        color: style.color ?? [255, 255, 255],
        bold: style.bold ?? false,
        italic: style.italic ?? false,
        underlined: style.underlined ?? false,
        strikethrough: style.strikethrough ?? false,
        obfuscated: style.obfuscated ?? false,
    }
}

interface Style {
    color: [number, number, number]
    bold: boolean
    italic: boolean
    underlined: boolean
    strikethrough: boolean
    obfuscated: boolean
}

type PartialStyle = Partial<Style>

@MakeSendable<Popup>("Popup", {
    title: strats.string,
    text: strats.string,
})
export class Popup extends Sendable {
    constructor(title: string, text: string) {
        super()
        this.title = title
        this.text = text
    }

    title
    text
}

interface DiscordInput {
    token: string | null
}

export const discordInput = new InputFields<DiscordInput>("DiscordInput", {
    token: {
        type: "string",
    },
})

export interface ResetPassword {
    password: string
    newPassword: string
}

export const resetPassword = new InputFields<ResetPassword>(
    "ResetPassword",
    {
        password: {
            type: "string",
        },
        newPassword: {
            type: "string",
        },
    },
    "Reset password"
)
