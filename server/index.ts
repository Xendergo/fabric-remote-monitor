import express from "express"
import { MinecraftInterface } from "./mc-communication/minecraft-interface"
import ws from "ws"
import { location } from "./database/Database"
import fs from "fs"
import path from "path"
import { pki } from "node-forge"
import { ConnectedUser } from "./networking/ConnectedUser"

if (!fs.existsSync(location)) {
    fs.mkdirSync(location, {
        recursive: true
    })
}

const keyPath = path.join(location, "https.key")
const certPath = path.join(location, "https.cert")
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log("Generating self signed SSL certificate...")
    const keys = pki.rsa.generateKeyPair(2048)
    const cert = pki.createCertificate()

    cert.publicKey = keys.publicKey
    cert.serialNumber = "01"
    cert.validity.notBefore = new Date()
    cert.validity.notAfter = new Date()
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear()+1)

    const attrs = [{
        name: 'commonName',
        value: 'fabric-remote-monitor'
      }, {
        name: 'countryName',
        value: 'US'
      }, {
        shortName: 'ST',
        value: ''
      }, {
        name: 'localityName',
        value: ''
      }, {
        name: 'organizationName',
        value: 'fabric-remote-monitor'
      }, {
        shortName: 'OU',
        value: 'fabric-remote-monitor'
      }]

    cert.setSubject(attrs)
    cert.setIssuer(attrs)
    cert.setExtensions([{
        name: 'basicConstraints',
        cA: true
      }, {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      }, {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      }, {
        name: 'nsCertType',
        client: true,
        server: true,
        email: true,
        objsign: true,
        sslCA: true,
        emailCA: true,
        objCA: true
      }, {
        name: 'subjectKeyIdentifier'
      }]);

    cert.sign(keys.privateKey)

    fs.writeFileSync(keyPath, pki.privateKeyToPem(keys.privateKey))
    fs.writeFileSync(certPath, pki.certificateToPem(cert))

    console.log("Done generating SSL certificate")
}

const app = express()

app.use(function(req, res, next) {
    console.log(req.url)
    next()
})

// const httpsServer = https.createServer({
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath),
// }, app)

const port = 8000

app.use(express.static("./build"))

// fuser -k 8000/tcp
const server = app.listen(port)
console.log(`Web server running on port ${port}`)

const minecraftInterface = new MinecraftInterface(8080)

const wss = new ws.Server({
    server: server,
    path: "/ws"
})

wss.on("connection", (connection) => {
  new ConnectedUser(connection)
})