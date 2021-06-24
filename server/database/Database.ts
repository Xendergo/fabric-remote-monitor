import sqlite3 from "sqlite3"
import { match } from "ts-pattern"

const platform = process.platform

const location = match(platform)
    .with("linux", () => "~/.config/fabric-remote-monitor")
    .with("win32", () => process.env.CSIDL_APPDATA + "\\fabric-remote-monitor")
    .with("darwin", () => "~/Library/Application Support/fabric-remote-monitor")
    .otherwise(() => {
        throw new Error("You're using an unsupported operating system")
    })

export const db = new sqlite3.Database(location + "/db.sqlite")

db.run(`
CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    discordId TEXT,
    password TEXT NOT NULL,
    admin INTEGER DEFAULT 0
)

CREATE TABLE IF NOT EXISTS settings (
    allowedUsers TEXT,
    proximityChat INTEGER DEFAULT 0,
    discordToken TEXT
)

CREATE TABLE IF NOT EXISTS guildSettings (
    id TEXT PRIMARY KEY,
    mirror TEXT
)

CREATE TABLE IF NOT EXISTS mods (
    source TEXT NOT NULL,
    file TEXT NOT NULL
)
`)