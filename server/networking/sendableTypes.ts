import { int, TagType } from "../mc-communication/nbt"
import {
    InputFields,
    MakeNbtSendable,
    MakeSendable,
    NbtSendable,
    Sendable,
} from "./sendableTypesHelpers"

@MakeSendable("LoginDetails")
export class LoginDetails extends Sendable {
    constructor(username: string, password: string) {
        super()
        this.username = username
        this.password = password
    }

    static channel() {
        return this.prototype.channel as string
    }

    username: string
    password: string
}

@MakeNbtSendable("SignupDetails", data => {
    return new SignupDetails(
        data.get("username")! as string,
        data.get("password")! as string
    )
})
export class SignupDetails extends NbtSendable {
    constructor(username: string, password: string) {
        super()
        this.username = username
        this.password = password
    }

    static channel() {
        return this.prototype.channel as string
    }

    username: string
    password: string

    encode() {
        return new Map(Object.entries(this))
    }
}

@MakeSendable("LoginFailed")
export class LoginFailed extends Sendable {
    static channel() {
        return this.prototype.channel as string
    }
}

@MakeSendable("LoginSuccessful")
export class LoginSuccessful extends Sendable {
    constructor(isAdmin: boolean) {
        super()
        this.isAdmin = isAdmin
    }

    isAdmin: boolean

    static channel() {
        return this.prototype.channel as string
    }
}

@MakeNbtSendable("MirrorMessage", data => {
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
})
export class MirrorMessage extends NbtSendable {
    constructor(message: string, style: Style) {
        super()
        this.message = message
        this.style = style
    }

    static channel() {
        return this.prototype.channel as string
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

interface DiscordInput {
    token: string | null
}

export const discordInput = new InputFields<DiscordInput>("DiscordInput", {
    token: {
        type: "string",
    },
})

interface ResetPassword {
    password: string
    newPassword: string
}

export const resetPassword = new InputFields<ResetPassword>(
    "ResetPassword",
    {
        password: {
            type: "string",
            confidential: true,
            placeholderLabel: true,
            customLabel: "Current password",
        },
        newPassword: {
            type: "string",
            confidential: true,
            placeholderLabel: true,
            customLabel: "New password",
        },
    },
    "Reset password"
)
