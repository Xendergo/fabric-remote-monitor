import { database } from "./DatabaseManager"

export class User {
    constructor(username: string) {
        this.username = username
    }

    username: string

    // @ts-ignore
    get admin(): Promise<boolean> {
        return database.adminStatus(this.username)
    }

    set admin(admin: boolean) {
        database.setAdmin(this.username, admin)
    }

    // @ts-ignore
    get discordToken(): Promise<string | null> {
        return database.discordId(this.username)
    }

    set discordToken(data: string | null) {
        database.setDiscordId(this.username, data)
    }

    // @ts-ignore
    get hiddenTabs(): Promise<string[]> {
        return database.getHiddenTabs(this.username)
    }

    set hiddenTabs(hiddenTabs: string[]) {
        database.setHiddenTabs(this.username, hiddenTabs)
    }

    async resetPassword(
        current: string,
        newPassword: string
    ): Promise<string | null> {
        const hashedCurrent = hashPassword(current)

        const password = await database.getPasswordHash(this.username)

        if (password != hashedCurrent) {
            return "original password is incorrect"
        }

        database.setPasswordHash(this.username, hashPassword(newPassword))

        return null
    }
}

export async function checkPassword(
    username: string,
    password: string
): Promise<User | null> {
    if (!(await database.userExists(username))) {
        return null
    }

    const hashed = hashPassword(password)

    if (hashed != (await database.getPasswordHash(username))) {
        return null
    }

    return new User(username)
}

export async function canCreateUser(username: string): Promise<true | string> {
    if (await database.userExists(username)) {
        return "That user already exists"
    }

    const settings = await database.getSettings()

    if (settings.allowedUsers == null) {
        return true
    }

    const allowedUsers = settings.allowedUsers

    if (allowedUsers.includes(username)) {
        return true
    }

    return "That username doesn't have permission to create an account"
}

export function hashPassword(password: string): string {
    // TODO: Use an actual hashing algorithm
    return password
}
