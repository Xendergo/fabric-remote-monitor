import { database } from "./DatabaseManager"
import { users } from "./Databases/1.0.0"

export class User {
    constructor(username: string, admin: boolean, discordId?: string) {
        this.username = username
        this.discordId = discordId
        this.admin = admin
    }

    username: string
    discordId?: string
    admin: boolean

    setAdminStatus(admin: boolean) {
        this.admin = admin

        database.updateRows(
            "users",
            {
                admin: admin ? 1 : 0,
            },
            {
                username: this.username,
            }
        )
    }

    resetPassword(current: string, newPassword: string): string | null {
        const hashedCurrent = hashPassword(current)

        const user = database.getRow<users>("users", {
            username: this.username,
        })

        if (user.password != hashedCurrent) {
            return "original password is incorrect"
        }

        database.updateRows(
            "users",
            {
                password: newPassword,
            },
            {
                username: this.username,
            }
        )

        return null
    }

    setDiscordId(newId: string) {
        database.updateRows(
            "users",
            {
                username: this.username,
            },
            {
                id: newId,
            }
        )

        this.discordId = newId
    }
}

export function getUserByUsername(username: string): User {
    const user = database.getRow<users>("users", {
        username: username,
    })

    if (user == undefined) {
        throw new Error("There's no user with that username")
    }

    return new User(user.username, user.admin == 1, user.discordId)
}

export function checkPassword(username: string, password: string): User | null {
    const hashed = hashPassword(password)

    const user = database.getRow<users>("users", {
        username: username,
    })

    if (user == undefined) {
        return null
    }

    if (hashed != user.password) {
        return null
    }

    return new User(user.username, user.admin == 1, user.discordId)
}

export function createUser(username: string, password: string): User {
    const hashed = hashPassword(password)

    database.addRow("users", {
        username: username,
        password: hashed,
    })

    return new User(username, false)
}

export function canCreateUser(username: string): true | string {
    const maybeUser = database.getRow("users", {
        username: username,
    })

    if (maybeUser != null) {
        return "That user already exists"
    }

    const settings = database.getSettings()

    if (settings.allowedUsers == null) {
        return true
    }

    const allowedUsers = settings.allowedUsers

    if (allowedUsers.includes(username)) {
        return true
    }

    return "That username doesn't have permission to create an account"
}

function hashPassword(password: string): string {
    // TODO: Use an actual hashing algorithm
    return password
}
