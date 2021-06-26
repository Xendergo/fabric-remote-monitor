import { TagType } from "../mc-communication/nbt";

export interface Sendable {
    channel: string
}

export interface NbtSendable extends Sendable {
    encode(): TagType
    decode(data: Map<string, TagType>): void
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

export class SignupDetails implements NbtSendable {
    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }

    channel = "SignupDetails"
    username: string
    password: string

    encode() {
        return new Map(Object.entries(this))
    }

    decode(data: Map<string, TagType>) {
        this.username = data.get("username") as string
        this.password = data.get("password") as string
    }
}

export class LoginFailed implements Sendable {
    channel = "LoginFailed"
}

export class LoginSuccessful implements Sendable {
    channel = "LoginSuccessful"
}