import express from "express"
import { MinecraftInterface } from './mc-communication/minecraft-interface';

const app = express()

const port = 8000

app.use(express.static("./build"))

// fuser -k 8000/tcp
app.listen(port)
console.log(`Web server running on port ${port}`)

const minecraftInterface = new MinecraftInterface(8080)