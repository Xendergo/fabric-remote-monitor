import { int, TagType } from "../mc-communication/nbt"
import {
    MakeSendable,
    Sendable,
    strats,
    Registry,
    InputFields,
} from "triangulum"

export const websiteRegistry = new Registry<
    Sendable,
    [(data: any) => boolean]
>()

@MakeSendable(websiteRegistry, "LoginDetails", [
    strats.each({
        username: strats.string,
        password: strats.string,
    }),
])
export class LoginDetails extends Sendable {
    constructor(username: string, password: string) {
        super()
        this.username = username
        this.password = password
    }

    username: string
    password: string
}

@MakeSendable(websiteRegistry, "LoginFailed", [strats.trust()])
export class LoginFailed extends Sendable {}

@MakeSendable(websiteRegistry, "LoginSuccessful", [
    strats.each({
        isAdmin: strats.boolean,
    }),
])
export class LoginSuccessful extends Sendable {
    constructor(isAdmin: boolean) {
        super()
        this.isAdmin = isAdmin
    }

    isAdmin: boolean
}

@MakeSendable(websiteRegistry, "MirrorMessage", [
    strats.each({
        message: strats.string,
        style: strats.each<Style>({
            color: strats.tupleEach<[number, number, number]>([
                strats.number,
                strats.number,
                strats.number,
            ]),
            bold: strats.boolean,
            italic: strats.boolean,
            underlined: strats.boolean,
            strikethrough: strats.boolean,
            obfuscated: strats.boolean,
        }),
    }),
])
export class MirrorMessage extends Sendable {
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

    static decode(data: Map<string, TagType>) {
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

@MakeSendable(websiteRegistry, "Popup", [
    strats.each({
        title: strats.string,
        text: strats.string,
    }),
])
export class Popup extends Sendable {
    constructor(title: string, text: string) {
        super()
        this.title = title
        this.text = text
    }

    title
    text
}

@MakeSendable(websiteRegistry, "Gamerules", [
    strats.each({
        gamerules: strats.Array<Gamerule>(
            strats.each<Gamerule>({
                name: strats.string,
                default: strats.string,
            })
        ),
    }),
])
export class Gamerules extends Sendable {
    constructor(gamerules: Gamerule[]) {
        super()
        this.gamerules = gamerules
    }

    gamerules: Gamerule[]

    encode(): Map<string, TagType> {
        const ret = new Map<string, TagType>()

        ret.set(
            "gamerules",
            this.gamerules.map(v => {
                const map = new Map<string, TagType>()

                map.set("name", v.name)
                map.set("default", v.default)

                return map
            })
        )

        return ret
    }

    static decode(data: Map<string, TagType>) {
        return new Gamerules(
            (data.get("gamerules")! as Map<string, TagType>[]).map(v => {
                return {
                    name: v.get("name") as string,
                    default: v.get("default") as string,
                }
            })
        )
    }
}

@MakeSendable(websiteRegistry, "DefaultGamerules", [strats.trust()])
export class DefaultGamerules extends Sendable {}

@MakeSendable(websiteRegistry, "ChangeGamerule", [
    strats.each({
        gamerule: strats.string,
        value: strats.string,
    }),
])
export class ChangeGamerule extends Sendable {
    constructor(gamerule: string, value: string) {
        super()

        this.gamerule = gamerule
        this.value = value
    }

    gamerule: string
    value: string

    encode() {
        const encoded = new Map<string, TagType>()

        encoded.set("gamerule", this.gamerule)
        encoded.set("value", this.value)

        return encoded
    }

    static decode(data: Map<string, TagType>) {
        return new ChangeGamerule(
            data.get("gamerule") as string,
            data.get("value") as string
        )
    }
}

export interface Gamerule {
    name: string
    default: string
}

@MakeSendable(websiteRegistry, "Pages", [
    strats.each({
        pages: strats.Array(
            strats.each({
                title: strats.string,
                data: strats.string,
                ordinal: strats.number,
                id: strats.string,
            })
        ),
    }),
])
export class Pages extends Sendable {
    constructor(pages: (Page & { id: string })[]) {
        super()

        this.pages = pages
    }

    pages: (Page & { id: string })[]

    getPages(): Map<string, Page> {
        return this.pages.reduce((a, v) => {
            a.set(v.id, v)
            return a
        }, new Map())
    }
}

@MakeSendable(websiteRegistry, "CurrentPages", [strats.trust()])
export class CurrentPages extends Sendable {}

@MakeSendable(websiteRegistry, "GithubLink", [
    strats.each({
        link: strats.string,
    }),
])
export class GithubLink extends Sendable {
    constructor(link: string) {
        super()
        this.link = link
    }

    link: string
}

export interface Page {
    title: string
    data: string
    ordinal: number
}

interface DiscordInput {
    token: string | null
}

export const discordInput = new InputFields<DiscordInput>(
    websiteRegistry,
    "DiscordInput",
    {
        token: {
            type: "string",
        },
    }
)

export interface ResetPassword {
    password: string
    newPassword: string
}

export const resetPassword = new InputFields<ResetPassword>(
    websiteRegistry,
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

export interface HideTabs extends DisableTabs {
    Home: boolean
    Info: boolean
    "Info Editor": boolean
    Discord: boolean
    Gamerules: boolean
    Features: boolean
}

export const hideTabs = new InputFields<HideTabs>(
    websiteRegistry,
    "HideTabs",
    {
        Home: { type: "bool", default: true },
        Info: { type: "bool", default: true },
        "Info Editor": { type: "bool", default: true },
        Discord: { type: "bool", default: true },
        Gamerules: { type: "bool", default: true },
        Features: { type: "bool", default: true },
    },
    "bruh"
)

export interface DisableTabs {
    Info: boolean
    "Info Editor": boolean
    Discord: boolean
    Gamerules: boolean
}

export const disableTabs = new InputFields<DisableTabs>(
    websiteRegistry,
    "GloballyHideTags",
    {
        Info: { type: "bool", default: true },
        "Info Editor": { type: "bool", default: true },
        Discord: { type: "bool", default: true },
        Gamerules: { type: "bool", default: true },
    },
    "bruh"
)
