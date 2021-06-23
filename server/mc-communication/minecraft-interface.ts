import net from "net"
import { decode, TagType, encode } from './nbt';

export class MinecraftInterface {
    constructor(port: number) {
        this.server = net.createServer()
        this.server.listen(port)
        // console.log(this); // just checking if I'm not insane
        // this is fine here
        // oh idea
        // bind the function maybe?
        this.server.on("connection", socket => {
            if (this.socket !== undefined) {
                // TODO: Send and error message
            }

            console.log("CONNECTION")

            this.socket = socket

            this.socket.on("data", data => this.onData(data))

            var testData: TagType = new Map()

            testData.set("bite", {
                value: 8n,
                type: "byte"
            })

            testData.set("strieng", "yeet")

            testData.set("thingy", {
                type: "intArray",
                value: [0n, 1n, 2n, 1n, 0n]
            })

            testData.set("listy", [
                {
                    type: "double",
                    value: 0.7
                },
                {
                    type: "double",
                    value: 0.8
                },
                {
                    type: "double",
                    value: 0.9
                },
                {
                    type: "double",
                    value: 0.8
                },
                {
                    type: "double",
                    value: 0.7
                },
            ])

            this.send("test", testData)
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
            this.currentPacket[this.currentPacket.length - this.currentBytesLeft] = byte
            this.currentBytesLeft--
    
            if (this.currentBytesLeft == 0) {
                this.onPacket(this.currentPacket)
            }
        }
    }
    
    onPacket(data: Buffer) {
        let parsedData = decode(data)

        console.log(parsedData)

        try {
            let channel = parsedData.get("channel") as string

            (this.listeners.get(channel) ?? []).forEach(listener => {
                listener(parsedData)
            });
        } catch {}
    }

    send(channel: string, data: Map<string, TagType>) {
        data.set("channel", channel)

        let encoded = encode(data)

        let lenBuf = Buffer.alloc(4)
        lenBuf.writeUInt32BE(encoded.length)

        console.log(lenBuf, encoded)

        this.socket?.write(lenBuf)
        this.socket?.write(encoded)
    }

    private server
    private socket?: net.Socket
    private listeners: Map<string, [(data: TagType) => void]> = new Map()
}