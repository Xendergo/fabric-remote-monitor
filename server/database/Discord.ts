import { database } from "./DatabaseManager"

export class DBGuild {
    constructor(id: string) {
        database.maybeCreateGuild(id)

        this.id = id
    }

    id: string

    // @ts-ignore
    get prefix(): Promise<string> {
        return database.getGuildPrefixById(this.id)
    }

    // @ts-ignore
    get mirror(): Promise<string | null> {
        return database.getGuildMirrorById(this.id)
    }

    set prefix(value: string) {
        database.setGuildPrefixById(this.id, value)
    }

    set mirror(value: string | null) {
        database.setGuildMirrorById(this.id, value)
    }
}
