import { database } from "./DatabaseManager"
import { guilds } from "./Databases/1.0.0"

export class DBGuild {
    constructor(id: string) {
        this.id = id

        let guild = database.getRow<guilds>("guilds", {
            id,
        })

        if (!guild) {
            database.addRow<guilds>("guilds", {
                id,
            })

            guild = database.getRow<guilds>("guilds", {
                id,
            })
        }

        this.prefix = guild.prefix
        this.mirror = guild.mirror
    }

    setPrefix(newPrefix: string) {
        database.updateRows<guilds>(
            "guilds",
            {
                prefix: newPrefix,
            },
            {
                id: this.id,
            }
        )

        this.prefix = newPrefix
    }

    setMirror(newMirror: string) {
        database.updateRows<guilds>(
            "guilds",
            {
                mirror: newMirror,
            },
            {
                id: this.id,
            }
        )

        this.mirror = newMirror
    }

    id: string
    prefix: string
    mirror: string
}
