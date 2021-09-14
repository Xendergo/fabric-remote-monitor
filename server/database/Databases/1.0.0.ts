import { registerDatabase, location } from "../DatabaseManager"
import path from "path"
import _ from "lodash"
import { DisableTabs, disableTabs, Page } from "../../networking/sendableTypes"
import { createClient } from "redis"
import { REDIS_PORT } from "../.."
import { RedisClientType } from "redis/dist/lib/client"
import { hashPassword } from "../User"

interface Settings {
    allowedUsers: string[] | null
    proximityChat: boolean
    discordToken: string | null
    disabledTabs: string[]
}

@registerDatabase("1.0.0")
export class Database_1_0_0 {
    constructor() {
        this.db = createClient({
            socket: { port: REDIS_PORT, host: "127.0.0.1" },
        })

        this.db.connect()
    }

    async onStart() {
        this.db.setNX("proximityChat", "false")
        this.db.setNX("disabledTabs", "")
    }

    async getSettings(): Promise<Settings> {
        let [allowedUsers, proximityChat, discordToken, disabledTabs] =
            await Promise.all([
                this.db.get("allowedUsers"),
                this.db.get("proximityChat"),
                this.db.get("discordToken"),
                this.db.get("disabledTabs"),
            ])

        return {
            allowedUsers:
                allowedUsers == null ? null : JSON.parse(allowedUsers),
            proximityChat: proximityChat != "false",
            discordToken: discordToken,
            disabledTabs: (disabledTabs ?? "").split("/"),
        }
    }

    async setDiscordToken(newToken: string | null) {
        if (newToken === null) {
            this.db.del("discordToken")
        } else {
            this.db.set("discordToken", newToken)
        }
    }

    async setDisabledTabs(pages: string[]) {
        await this.db.set("disabledTabs", pages.join("/"))
    }

    async maybeCreateGuild(id: string) {
        let key = "guild_" + id

        if (await this.db.exists(key)) return

        this.db.hSet(key, ["id", id])
    }

    async getGuildPrefixById(id: string) {
        return (await this.db.hGet("guild_" + id, "prefix")) ?? "mc"
    }

    async getGuildMirrorById(id: string) {
        return (await this.db.hGet("guild_" + id, "mirror")) ?? null
    }

    async setGuildPrefixById(id: string, prefix: string) {
        return this.db.hSet("guild_" + id, ["prefix", prefix])
    }

    async setGuildMirrorById(id: string, mirror: string | null) {
        let key = "guild_" + id

        if (mirror === null) {
            this.db.hDel(key, "mirror")
        } else {
            this.db.hSet(key, ["mirror", mirror])
        }
    }

    async getPageIds() {
        return (await this.db.sScan("pages", 0)).members
    }

    async getPages() {
        return Promise.all(
            (await this.getPageIds()).map(pageId => this.getPage(pageId))
        )
    }

    async getPage(id: string): Promise<Page & { id: string }> {
        let key = "page_" + id

        let [ordinal, title, data] = await Promise.all([
            this.db.hGet(key, "ordinal"),
            this.db.hGet(key, "title"),
            this.db.hGet(key, "data"),
        ])

        return {
            id,
            ordinal: parseInt(ordinal!),
            title: title!,
            data: data!,
        }
    }

    async deletePages() {
        let pageIds = await this.getPageIds()

        await Promise.all([
            this.db.del("pages"),
            this.db.set("pages_id_inc", "0"),
        ])

        for (const pageId of pageIds) {
            this.db.del("page_" + pageId)
        }
    }

    async addPage(data: Page & { id: string }) {
        let key = "page_" + data.id
        console.log(key, data)

        await Promise.all([
            this.db.hSet(key, ["ordinal", data.ordinal.toString()]),
            this.db.hSet(key, ["title", data.title]),
            this.db.hSet(key, ["data", data.data]),
        ])

        await this.db.sAdd("pages", data.id)
    }

    async createUser(username: string, password: string) {
        let hashed = hashPassword(password)

        this.db.hSet("user_" + username, ["password", hashed])
    }

    async userExists(username: string) {
        return this.db.exists("user_" + username)
    }

    async adminStatus(username: string) {
        return (await this.db.hGet("user_" + username, "admin")) == "true"
            ? true
            : false
    }

    async setAdmin(username: string, admin: boolean) {
        await this.db.hSet("user_" + username, [
            "admin",
            admin ? "true" : "false",
        ])
    }

    async discordId(username: string) {
        return (await this.db.hGet("user_" + username, "discordId")) ?? null
    }

    async setDiscordId(username: string, newId: string | null) {
        if (newId == null) {
            await this.db.hDel("user_" + username, "discordId")
        } else {
            await this.db.hSet("user_" + username, ["discordId", newId])
        }
    }

    async getHiddenTabs(username: string) {
        return (
            (await this.db.hGet("user_" + username, "hiddenTabs")) ?? ""
        ).split("/")
    }

    async setHiddenTabs(username: string, hiddenTabs: string[]) {
        this.db.hSet("user_" + username, ["hiddenTabs", hiddenTabs.join("/")])
    }

    async getPasswordHash(username: string) {
        return (await this.db.hGet("user_" + username, "password"))!
    }

    async setPasswordHash(username: string, passwordHash: string) {
        await this.db.hSet("user_" + username, ["password", passwordHash])
    }

    private db: RedisClientType<{}, {}>

    static datafixer() {
        // There's no previous version so a datafixer is unessesary
    }
}
