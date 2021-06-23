import express from "express"
import { MinecraftInterface } from './mc-communication/minecraft-interface';
import { spawn } from "child_process";

if (process.argv[2] == "debug") {
    let vite = spawn("npm", ["run", "build"], {
        cwd: __dirname + "/svelte"
    })
    vite.stdout?.on("data", (data) => {
        console.log(data.toString("utf-8"))
    })
}

const app = express()

const port = 8000

app.use(express.static("./build"))

// fuser -k 8000/tcp
app.listen(port)
console.log(`Web server running on port ${port}`)

const minecraftInterface = new MinecraftInterface(8080)