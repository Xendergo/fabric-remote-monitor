import { TagType } from "../mc-communication/nbt"

export abstract class Sendable {
    channel: string | undefined
}

export abstract class NbtSendable extends Sendable {
    abstract encode(): Map<string, TagType>
}

export const nbtSendable: Map<
    string,
    (data: Map<string, TagType>) => NbtSendable
> = new Map()

function MakeSendable<T extends Sendable>(channel: string) {
    return (constructor: Function) => {
        constructor.prototype.channel = channel
    }
}

function MakeNbtSendable<T extends NbtSendable>(
    channel: string,
    decode: (data: Map<string, TagType>) => T
) {
    return (constructor: Function) => {
        nbtSendable.set(channel, decode)
        constructor.prototype.channel = channel
    }
}

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
    static channel() {
        return this.prototype.channel as string
    }
}

@MakeNbtSendable("MirrorMessage", data => {
    return new MirrorMessage(
        data.get("author")! as string,
        data.get("message")! as string
    )
})
export class MirrorMessage extends NbtSendable {
    constructor(author: string, message: string) {
        super()
        this.author = author
        this.message = message
    }

    static channel() {
        return this.prototype.channel as string
    }

    author
    message

    encode() {
        return new Map(Object.entries(this))
    }
}

@MakeSendable("ClientMirrorMessage")
export class ClientMirrorMessage extends Sendable {
    constructor(message: string) {
        super()
        this.message = message
    }

    static channel() {
        return this.prototype.channel as string
    }

    message
}
