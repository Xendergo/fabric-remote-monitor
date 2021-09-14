import path from "path"
import { match } from "ts-pattern"
import fs from "fs"
import { version } from "../package.json"

const datafixers: { version: string; datafixer: () => void }[] = []

export function registerDatabase(dbVersion: string) {
    return function (databaseConstructor: {
        new (...args: any[]): object
        datafixer(): void
    }) {
        datafixers.push({
            version: dbVersion,
            datafixer: databaseConstructor.datafixer,
        })
    }
}

const platform = process.platform

import { Database_1_0_0 } from "./Databases/1.0.0"

export const location = match(platform)
    .with("linux", () =>
        path.join(process.env.HOME!, ".config/fabric-remote-monitor")
    )
    .with("win32", () =>
        path.join(process.env.CSIDL_APPDATA!, "fabric-remote-monitor")
    )
    .with("darwin", () =>
        path.join(
            process.env.HOME!,
            "Library/Application Support/fabric-remote-monitor"
        )
    )
    .otherwise(() => {
        throw new Error("You're using an unsupported operating system")
    })

if (!fs.existsSync(location)) {
    fs.mkdirSync(location, {
        recursive: true,
    })
}

if (!fs.existsSync(path.join(location, "version.txt"))) {
    fs.writeFileSync(path.join(location, "version.txt"), version, {
        encoding: "ascii",
    })
}

let currentVersion = fs.readFileSync(path.join(location, "version.txt"), {
    encoding: "ascii",
})

function getSortingNumberFromSplit(a: number[], b: number[]): number {
    if (a[0] === b[0] && a.length > 1) {
        return getSortingNumberFromSplit(a.slice(1), b.slice(1))
    }

    return a[0] - b[0]
}

function getSortingNumber(a: string, b: string): number {
    const versionA = a.split(".").map(v => parseInt(v))
    const versionB = b.split(".").map(v => parseInt(v))

    if (versionA.length !== versionB.length) {
        throw new Error(
            `Two versions have different amounts of version numbers: ${versionA}, ${versionB}`
        )
    }

    return getSortingNumberFromSplit(versionA, versionB)
}

function constructDatabase<
    DBConstructor extends { new (...constructorArgs: Args): DB },
    DB,
    Args extends any[]
>(constructor: DBConstructor, ...args: Args): DB {
    if (version !== currentVersion) {
        datafixers.sort((a, b) => {
            return getSortingNumber(a.version, b.version)
        })

        for (const datafixer of datafixers) {
            if (getSortingNumber(currentVersion, datafixer.version) < 0) {
                datafixer.datafixer()
            }
        }

        fs.writeFileSync(path.join(location, "version.txt"), version, {
            encoding: "ascii",
        })
    }

    return new constructor(...args)
}

export const database: Database_1_0_0 = constructDatabase(Database_1_0_0)
