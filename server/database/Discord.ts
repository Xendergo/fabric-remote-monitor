import { db } from "./Database"

const getGuild = db.prepare<{ id: string }>(
    "SELECT * FROM guilds WHERE id = $id"
)
const addGuild = db.prepare<{ id: string }>(
    "INSERT INTO guilds (id) VALUES ($id)"
)
const setPrefix = db.prepare<{ prefix: string; id: string }>(
    "UPDATE guilds SET prefix = $prefix WHERE id = $id"
)
const setMirror = db.prepare<{ mirror: string; id: string }>(
    "UPDATE guilds SET mirror = $mirror WHERE id = $id"
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

    setMirror(newMirror: string) {
        setMirror.run({
            mirror: newMirror,
            id: this.id,
        })

        this.mirror = newMirror
    }

    id: string
    prefix: string
    mirror: string
}
