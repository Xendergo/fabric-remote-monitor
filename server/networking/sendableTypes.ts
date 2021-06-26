import { TagType } from "../mc-communication/nbt";

export interface Sendable {
    channel: string
}

export interface NbtSendable extends Sendable {
    encode(): TagType
    decode(data: TagType): void
}

export class LoginDetails implements Sendable {
    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }

    channel = "LoginDetails"
    username: string
    password: string
}

export class LoginFailed implements Sendable {
    channel = "LoginFailed"
}

export class LoginSuccessful implements Sendable {
    channel = "LoginSuccessful"
}