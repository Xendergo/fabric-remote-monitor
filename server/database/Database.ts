import path from "path"
import sqlite3 from "better-sqlite3"
import { match } from "ts-pattern"

const platform = process.platform

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

export const db = new sqlite3(path.join(location, "db.sqlite"))

db.prepare(
    `
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    discordId TEXT,
    password TEXT NOT NULL,
    admin INTEGER DEFAULT 0
);
`
).run()

db.prepare(
    `
CREATE TABLE IF NOT EXISTS settings (
    allowedUsers TEXT,
    proximityChat INTEGER DEFAULT 0,
    discordToken TEXT
);
`
).run()

const settings = db.prepare(`SELECT COUNT(*) FROM settings`).get()

if (settings["COUNT(*)"] == 0) {
    db.prepare(`INSERT INTO settings (proximityChat) VALUES (0)`).run()
}

db.prepare(
    `
CREATE TABLE IF NOT EXISTS guilds (
    id TEXT PRIMARY KEY,
    mirror TEXT,
    prefix TEXT DEFAULT "mc"
);
`
).run()

db.prepare(
    `
CREATE TABLE IF NOT EXISTS mods (
    source TEXT NOT NULL,
    file TEXT NOT NULL
);
`
).run()
