import net from "net"
import { decode, TagType, encode } from "./nbt"
import {
    NbtSendable,
    nbtSendable,
    sendableClasses,
} from "../networking/sendableTypes"

export class MinecraftInterface {
    constructor(port: number) {
        this.server = net.createServer()
        this.server.listen(port)

        this.server.on("connection", socket => {
            if (this.socket !== undefined) {
                // TODO: Send and error message
            }

            console.log("CONNECTION")

            this.socket = socket

            this.socket.on("data", data => this.onData(data))
        })

        console.log(`Tcp server running on port ${port}`)
    }

    private currentBytesLeft = 0
    private currentPacket = Buffer.alloc(0)

    private currentLengthIndex = 0
    private lengthBuffer = Buffer.alloc(4)

    onData(data: Buffer) {
        for (const byte of data) {
            this.onByte(byte)
        }
    }

    onByte(byte: number) {
        if (this.currentBytesLeft == 0) {
            if (this.currentLengthIndex != 4) {
                this.lengthBuffer[this.currentLengthIndex] = byte
                this.currentLengthIndex++
            }

            if (this.currentLengthIndex == 4) {
                this.currentLengthIndex = 0
                this.currentBytesLeft = this.lengthBuffer.readInt32BE()
                this.currentPacket = Buffer.alloc(this.currentBytesLeft)
            }
        } else {
            this.currentPacket[
                this.currentPacket.length - this.currentBytesLeft
            ] = byte
            this.currentBytesLeft--

            if (this.currentBytesLeft == 0) {
                this.onPacket(this.currentPacket)
            }
        }
    }

    onPacket(data: Buffer) {
        const parsedData = decode(data)

        const decoded = nbtSendable.get(parsedData.get("channel")! as string)!(
            parsedData
        )

        Object.setPrototypeOf(
            decoded,
            sendableClasses.get(decoded.channel!)!.prototype
        )

        try {
            let channel = parsedData.get("channel") as string

            ;(this.listeners.get(channel) ?? []).forEach(listener => {
                listener(decoded)
            })
        } catch {}
    }

    send<T extends NbtSendable>(data: T) {
        const converted = data.encode()

        converted.set("channel", data.channel!)

        let encoded = encode(converted)

        let lenBuf = Buffer.alloc(4)
        lenBuf.writeUInt32BE(encoded.length)

        this.socket?.write(lenBuf)
        this.socket?.write(encoded)
    }

    listen<T extends NbtSendable>(
        channelClass: { channel(): string; new (...data: any[]): T },
        callback: (data: T) => void
    ) {
        const channel = channelClass.channel()

        if (!this.listeners.has(channel)) this.listeners.set(channel, [])

        this.listeners.get(channel)!.push(callback as any)
    }

    private server
    private socket?: net.Socket
    private listeners: Map<string, ((data: NbtSendable) => void)[]> = new Map()
}
