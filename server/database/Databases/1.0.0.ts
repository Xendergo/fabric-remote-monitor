import { registerDatabase, location } from "../DatabaseManager"
import sqlite3 from "better-sqlite3"
import path from "path"
import { Statement } from "better-sqlite3"
import _ from "lodash"

export type users = {
    username: string
    discordId: string
    password: string
    admin: number
    hiddenPages: string
}

export type guilds = {
    id: string
    mirror: string
    prefix: string
}

export type pages = {
    id: number
    ordinal: number
    title: string
    data: string
}

export type Tables = users | guilds | pages

export type Table<T extends Tables> = T extends users
    ? "users"
    : T extends guilds
    ? "guilds"
    : T extends pages
    ? "pages"
    : never

interface Settings {
    allowedUsers: string[] | null
    proximityChat: boolean
    discordToken: string
}

@registerDatabase("1.0.0")
export class Database_1_0_0 {
    constructor() {
        this.db = new sqlite3(path.join(location, "db.sqlite"))

        this.run(
            `
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            discordId TEXT,
            password TEXT NOT NULL,
            admin INTEGER NOT NULL DEFAULT 0,
            hiddenPages TEXT NOT NULL DEFAULT ""
        );
        `
        )

        this.run(`
        CREATE TABLE IF NOT EXISTS settings (
            allowedUsers TEXT,
            proximityChat INTEGER DEFAULT 0,
            discordToken TEXT
        );
        `)

        const settings = this.get(`SELECT COUNT(*) FROM settings`)

        if (settings["COUNT(*)"] == 0) {
            this.run(`INSERT INTO settings (proximityChat) VALUES (0)`)
        }

        this.run(
            `
        CREATE TABLE IF NOT EXISTS guilds (
            id TEXT PRIMARY KEY,
            mirror TEXT,
            prefix TEXT DEFAULT "mc"
        );
        `
        )

        this.run(
            `
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY,
            ordinal INTEGER NOT NULL UNIQUE,
            title TEXT NOT NULL,
            data TEXT NOT NULL
        );
            `
        )
    }

    private prepared: Map<string, Statement> = new Map()

    private getStatement(query: string) {
        if (!this.prepared.has(query)) {
            this.prepared.set(query, this.db.prepare(query))
        }

        return this.prepared.get(query)!
    }

    private run(query: string, args: object = {}) {
        this.getStatement(query).run(args)
    }

    private get(query: string, args: object = {}) {
        return this.getStatement(query).get(args)
    }

    private getAll(query: string, args: object = {}) {
        return this.getStatement(query).all(args)
    }

    private constructWhereClause(where: object) {
        let whereClause = ""

        if (Object.keys(where).length !== 0) {
            const wheres: string[] = []

            for (const key in where) {
                wheres.push(`${key}=$${key}`)
            }

            whereClause = `WHERE ${wheres.join(" and ")}`
        }

        return whereClause
    }

    private constructGetStatement<T extends Tables>(
        table: Table<T>,
        where: Partial<T>
    ) {
        return `SELECT * FROM ${table} ${this.constructWhereClause(where)}`
    }

    private constructInsertStatement<T extends Tables>(
        table: Table<T>,
        values: Partial<T>
    ) {
        const keys = Object.keys(values)
        const templateKeys = keys.map(key => `$${key}`)

        return `INSERT INTO ${table} (${keys.join(
            ", "
        )}) VALUES (${templateKeys.join(", ")})`
    }

    private constructUpdateStatement<T extends Tables>(
        table: Table<T>,
        values: Partial<T>,
        where: Partial<T>
    ) {
        let setClause = []

        for (const key in values) {
            setClause.push(`${key} = $__assign_${key}`)
        }

        return `UPDATE ${table} SET ${setClause.join(
            ", "
        )} ${this.constructWhereClause(where)}`
    }

    private constructDeleteStatement<T extends Tables>(
        table: Table<T>,
        where: Partial<T>
    ) {
        return `DELETE FROM ${table} ${this.constructWhereClause(where)}`
    }

    getRow<T extends Tables>(table: Table<T>, where: Partial<T> = {}): T {
        return this.get(this.constructGetStatement(table, where), where)
    }

    getRows<T extends Tables>(table: Table<T>, where: Partial<T> = {}): T[] {
        return this.getAll(this.constructGetStatement(table, where), where)
    }

    addRow<T extends Tables>(table: Table<T>, values: Partial<T>) {
        this.run(this.constructInsertStatement(table, values), values)
    }

    updateRows<T extends Tables>(
        table: Table<T>,
        values: Partial<T>,
        where: Partial<T> = {}
    ) {
        this.run(
            this.constructUpdateStatement(table, values, where),
            _.assign(
                _.mapKeys(values, (value, key) => `__assign_${key}`),
                where
            )
        )
    }

    delete<T extends Tables>(table: Table<T>, where: Partial<T> = {}) {
        this.run(this.constructDeleteStatement(table, where))
    }

    getSettings() {
        const settings = this.get(`SELECT * FROM settings ASC LIMIT 1`)

        return {
            allowedUsers: JSON.parse(settings.allowedUsers),
            proximityChat: settings.proximityChat != 0,
            discordToken: settings.discordToken,
        } as Settings
    }

    setDiscordToken(newToken: string | null) {
        this.run(`UPDATE settings SET discordToken = $newToken`, {
            newToken: newToken,
        })
    }

    private db

    static datafixer() {
        // There's no previous version so a datafixer is unessesary
    }
}
