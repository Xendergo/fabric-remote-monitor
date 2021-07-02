import { db } from "./Database"
import { getSettings } from "./Settings"

const setAdmin = db.prepare(
    "UPDATE users SET admin = $admin WHERE username = $username"
)
const getUser = db.prepare("SELECT * FROM users WHERE username = $username")
const insertUser = db.prepare(`INSERT INTO users (
    username,
    password
) VALUES (
    $username,
    $password
)`)

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

        setAdmin.run({
            admin: admin,
            username: this.username,
        })
    }
}

export function getUserByUsername(username: string): User {
    const user = getUser.get({
        username: username,
    })

    if (user == undefined) {
        throw new Error("There's no user with that username")
    }

    return new User(user.username, user.admin == 1, user.discordId)
}

export function checkPassword(username: string, password: string): User | null {
    const hashed = hashPassword(password)

    const user = getUser.get({
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

    insertUser.run({
        username: username,
        password: hashed,
    })

    return new User(username, false)
}

export function canCreateUser(username: string): true | string {
    const maybeUser = getUser.get({
        username: username,
    })

    if (maybeUser != null) {
        return "That user already exists"
    }

    const settings = getSettings()

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
