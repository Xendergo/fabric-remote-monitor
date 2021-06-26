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

    channel = "loginDetails"
    username: string
    password: string
}