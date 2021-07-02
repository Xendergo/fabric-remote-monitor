import net from "net"
import { decode, encode } from "./nbt"
import {
    NbtSendable,
    parseNbtInput,
    ListenerManager,
} from "../networking/sendableTypesHelpers"

export class MinecraftInterface extends ListenerManager<NbtSendable, Buffer> {
    constructor(port: number) {
        super()

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
                this.onData(this.currentPacket)
            }
        }
    }

    encode(data: NbtSendable) {
        const converted = data.encode()

        converted.set("channel", data.channel!)

        return encode(converted)
    }

    decode(data: Buffer) {
        const parsedData = decode(data)

        return parseNbtInput(parsedData)
    }

    transmit(data: Buffer) {
        let lenBuf = Buffer.alloc(4)
        lenBuf.writeUInt32BE(data.length)

        this.socket?.write(lenBuf)
        this.socket?.write(data)
    }

    private server
    private socket?: net.Socket
}
