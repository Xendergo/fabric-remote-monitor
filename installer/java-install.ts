import { spawn } from "child_process"
import process from "process"
import fs from "fs"
import { writeFile } from "fs/promises"
import got from "got"
import path from "path"
import os from "os"

function getOS() {
    const platform = os.type()
    if (platform == "Windows_NT") return "windows"
    if (platform == "Darwin") return "mac"
    if (platform == "Linux") return "linux"
    throw Error("Operating System Unsupported!")
}

async function getLatestJavaInstaller(): Promise<void> {
    console.log(
        (
            await got(
                `https://api.adoptopenjdk.net/v3/binary/latest/16/${getOS()}/${os.}`
            )
        ).body
    )
}
