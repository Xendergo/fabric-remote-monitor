import net from "net"
import { decode, encode } from "./nbt"
import { AbstractListenerManager } from "../../sendableTypes/sendableTypesHelpers"
import { logger } from ".."
import { nbtSendable, NbtSendable } from "../networking/sendableTypes"

export class MinecraftInterface extends AbstractListenerManager<
    NbtSendable,
    Buffer
> {
    constructor(port: number) {
        super()

        this.server = net.createServer()
        this.server.listen(port)

        this.server.on("connection", socket => {
            if (this.socket !== undefined) {
                // TODO: Send and error message
            }

            logger.info("A minecraft server is now connected to the web server")

            this.socket = socket

            this.socket.on("data", data => this.onDataFromSocket(data))

            this.ready()
        })

        logger.info(`Tcp server running on port ${port}`)
    }

    private currentBytesLeft = 0
    private currentPacket = Buffer.alloc(0)

    private currentLengthIndex = 0
    private lengthBuffer = Buffer.alloc(4)

    onDataFromSocket(data: Buffer) {
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
        const encoded = data.encode()

        encoded.set("channel", data.channel!)

        return encode(encoded)
    }

    decode(data: Buffer) {
        const parsedData = decode(data)

        return nbtSendable.get(parsedData.get("channel") as string)!(parsedData)
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
