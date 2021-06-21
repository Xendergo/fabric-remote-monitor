import net from "net"
import { read, TagType } from "./nbt"

export class MinecraftInterface {
    constructor(port: number) {
        this.server = net.createServer()
        this.server.listen(port)

        this.server.on("connection", (socket) => {
            if (this.socket !== undefined) {
                // TODO: Send and error message
            }

            console.log("CONNECTION")

            this.socket = socket

            this.socket.on("data", this.onData)
        })

        console.log(`Tcp server running on port ${port}`)
    }

    onData(data: Buffer) {
        let parsedData = read(data)

        console.log(parsedData)

        try {
            let channel = parsedData.channel as string

            (this.listeners.get(channel) ?? []).forEach(listener => {
                listener(parsedData)
            });
        } catch {}
    }

    private server
    private socket?: net.Socket
    private listeners: Map<string, [(data: TagType) => void]> = new Map()
}