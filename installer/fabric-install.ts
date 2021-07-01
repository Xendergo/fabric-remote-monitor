// super prototype-y proof of concept
import { spawn } from "child_process"
import process from "process"
import fs from "fs"
import { writeFile } from "fs/promises"
import got from "got"
import path from "path"

// so the current implementation goes off the assumption
// that everything will be in the fabric-remote-monitor folder
// and that this script will be called from within the server folder

// comment out later
if (fs.existsSync("fabric")) fs.rmdirSync("fabric")

// default will be set to outside of the server folder
// in a folder called fabric
if (fs.existsSync("fabric")) throw Error("Fabric Folder Already Exists")
else {
    fs.mkdirSync("fabric")
    process.chdir("fabric")
}

// pretty reliable way of getting versions / stable stuff
// downloads fabric installer to the directory above server
async function getLatestFabricInstaller(): Promise<void> {
    // grabs the first result of the fabric installer url
    // which should be the latest stable version
    const latestURL = (
        await got("https://meta.fabricmc.net/v2/versions/installer").json<
            [{ url: string; maven: string; version: string; stable: boolean }]
        >()
    )[0].url

    console.log(latestURL)

    const downloadStream = got.stream(latestURL)
    const writeStream = fs.createWriteStream(
        path.resolve("./fabric-installer.jar")
    )

    downloadStream.pipe(writeStream)
    console.log(downloadStream, writeStream)

    return new Promise((res, rej) => {
        writeStream.on("error", err => {
            rej(err)
        })
        writeStream.on("finish", () => {
            writeStream.close()
            res()
        })
    })
}

async function autoFillEULA() {
    writeFile("eula.txt", "eula=true")
}

// @TODO
async function installRemoteMonitorMod() {}

async function runFabricInstaller() {
    spawn("java", [
        "-jar",
        "fabric-installer.jar",
        "server",
        "-downloadMinecraft",
    ])
}

async function installFabric(dir?: string) {
    if (dir && !path.isAbsolute(dir))
        throw Error("Fabric install path is invalid! Must be an absolute path.")
    if (dir && path.isAbsolute(dir)) process.chdir(dir)
    autoFillEULA()
    installRemoteMonitorMod() // optional?
    await getLatestFabricInstaller()
    await runFabricInstaller()
}

installFabric()
