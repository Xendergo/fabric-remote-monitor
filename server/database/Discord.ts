import { db } from "./Database"

const getGuild = db.prepare("SELECT * FROM guilds WHERE id = $id")
const addGuild = db.prepare("INSERT INTO guilds (id) VALUES ($id)")
const setPrefix = db.prepare(
    "UPDATE guilds SET prefix = $prefix WHERE id = $id"
)

export class DBGuild {
    constructor(id: string) {
        this.id = id

        let guild = getGuild.get({
            id,
        })

        if (!guild) {
            addGuild.run({
                id,
            })

            guild = getGuild.get({
                id,
            })
        }

        this.prefix = guild.prefix
        this.mirror = guild.mirror
    }

    setPrefix(newPrefix: string) {
        setPrefix.run({
            prefix: newPrefix,
            id: this.id,
        })

        this.prefix = newPrefix
    }

    id: string
    prefix: string
    mirror: string
}