import express from "express"
import { MinecraftInterface } from "./mc-communication/minecraft-interface"
import ws from "ws"
import fs from "fs"
import path from "path"
import { pki } from "node-forge"
import { ConnectedUser } from "./networking/ConnectedUser"
import { MirrorMessage } from "./networking/sendableTypes"
import { DiscordBot } from "./discord-bot/bot"
import { createLogger, format, transports } from "winston"
import { broadcast } from "./networking/WsConnectionManager"
import { serverStateManager } from "./server-state/server-state"
import { MinecraftInterfaceReady } from "./server-state/serverStateMessages"
import { database, location } from "./database/DatabaseManager"

if (!fs.existsSync(location)) {
    fs.mkdirSync(location, {
        recursive: true,
    })
}

export const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: "YYYY, MMM Do - H:m:s",
        }),
        format.cli(),
        format.printf(info => {
            return `${info.timestamp} ${info.level}: ${info.message}`
        })
    ),
    transports: [
        new transports.File({ filename: path.join(location, "logs.log") }),
        new transports.Console(),
    ],
})

const keyPath = path.join(location, "https.key")
const certPath = path.join(location, "https.cert")
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    logger.info("Generating self signed SSL certificate...")
    const keys = pki.rsa.generateKeyPair(2048)
    const cert = pki.createCertificate()

    cert.publicKey = keys.publicKey
    cert.serialNumber = "01"
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(
        cert.validity.notBefore.getFullYear() + 1
    )

    const attrs = [
        {
            name: "commonName",
            value: "fabric-remote-monitor",
        },
        {
            name: "countryName",
            value: "US",
        },
        {
            shortName: "ST",
            value: "",
        },
        {
            name: "localityName",
            value: "",
        },
        {
            name: "organizationName",
            value: "fabric-remote-monitor",
        },
        {
            shortName: "OU",
            value: "fabric-remote-monitor",
        },
    ]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    cert.setExtensions([
        {
            name: "basicConstraints",
            cA: true,
        },
        {
            name: "keyUsage",
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true,
        },
        {
            name: "extKeyUsage",
            serverAuth: true,
            clientAuth: true,
            codeSigning: true,
            emailProtection: true,
            timeStamping: true,
        },
        {
            name: "nsCertType",
            client: true,
            server: true,
            email: true,
            objsign: true,
            sslCA: true,
            emailCA: true,
            objCA: true,
        },
        {
            name: "subjectKeyIdentifier",
        },
    ])

    cert.sign(keys.privateKey)

    fs.writeFileSync(keyPath, pki.privateKeyToPem(keys.privateKey))
    fs.writeFileSync(certPath, pki.certificateToPem(cert))

    logger.info("Done generating SSL certificate")
}

const app = express()

// const httpsServer = https.createServer({
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath),
// }, app)

const port = 8000

app.use(express.static("./build"))

// fuser -k 8000/tcp
const server = app.listen(port)
logger.info(`Web server running on port ${port}`)

export const minecraftInterface = new MinecraftInterface(8090)

serverStateManager.send(new MinecraftInterfaceReady())

minecraftInterface.listen<MirrorMessage>(MirrorMessage, data => {
    broadcast(data)

    discordBot?.onMirrorMessage(data)
})

const wss = new ws.Server({
    server: server,
    path: "/ws",
})

export const connectedUsers: Set<ConnectedUser> = new Set()

wss.on("connection", connection => {
    connectedUsers.add(new ConnectedUser(connection))
})

export let discordBot: DiscordBot | null = null

export function destroyDiscordBot() {
    if (discordBot != null) {
        discordBot.logout()
        discordBot = null
    }
}

export function createDiscordBot() {
    const token = database.getSettings().discordToken

    if (token == null) return

    discordBot = new DiscordBot()
}

if (database.getSettings().discordToken != null) {
    createDiscordBot()
}
