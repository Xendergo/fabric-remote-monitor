import { spawn } from "child_process"
import process from "process"
import fs from "fs"
import { writeFile } from "fs/promises"
import got from "got"
import path from "path"
import os from "os"
import { createGunzip } from "zlib"

function getOS() {
    const platform = os.type()
    if (platform == "Windows_NT") return "windows"
    if (platform == "Darwin") return "mac"
    if (platform == "Linux") return "linux"
    throw Error("Operating System Unsupported!")
}

function getArch() {
    const arch = os.arch() as
        | "x32"
        | "x64"
        | "arm"
        | "arm64"
        | "s390x"
        // | "mipsel"
        // | "mips"
        | "ia32"
        | "ppc64"
    if (arch == "arm64") return "aarch64"
    if (arch == "ia32") return "x86"
    return arch
}

export async function getLatestJavaInstaller(): Promise<void> {
    console.log(
        `https://api.adoptopenjdk.net/v3/binary/latest/16/ga/${getOS()}/${getArch()}/jre/hotspot/normal/adoptopenjdk`
    )
    const downloadStream = got.stream(
        `https://api.adoptopenjdk.net/v3/binary/latest/16/ga/${getOS()}/${getArch()}/jre/hotspot/normal/adoptopenjdk`,
        {
            followRedirect: true,
        }
    )

    if (!downloadStream) throw Error("Java runtime not found for your system")
    const writeStream = fs.createWriteStream(path.resolve("./java"))
    const unzip = createGunzip()

    downloadStream.pipe(writeStream)

    // downloadStream.pipe(unzip)

    // unzip.pipe(writeStream)

    writeStream.once("close", () => {
        console.log("Java downloaded?")
    })
}
