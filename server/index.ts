import express from "express"
import { MinecraftInterface } from "./mc-communication/minecraft-interface"
import ws from "ws"
import { execSync } from "child_process"
import { location } from "./database/Database"
import fs from "fs"
import path from "path"
import https from "https"

if (!fs.existsSync(location)) {
    fs.mkdirSync(location, {
        recursive: true
    })
}

const keyPath = path.join(location, "https.key")
const certPath = path.join(location, "https.cert")
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log("Generating self signed SSL certificate...")
    fs.writeFileSync(keyPath, "")
    fs.writeFileSync(certPath, "")
    execSync(`openssl req -nodes -new -x509 -keyout "${keyPath}" -out "${certPath}" -passout pass:password -passin pass:password -subj "/C=US/ST=./L=./O=fabric-remote-monitor/OU=fabric-remote-monitor/CN=fabric-remote-monitor"`)
    console.log("Done generating SSL certificate")
}

const app = express()

const httpsServer = https.createServer({
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
}, app)

const port = 8000

app.use(express.static("./build"))

// fuser -k 8000/tcp
app.listen(port)
console.log(`Web server running on port ${port}`)

const minecraftInterface = new MinecraftInterface(8080)

const wss = new ws.Server({
    server: httpsServer,
    path: "ws"
})