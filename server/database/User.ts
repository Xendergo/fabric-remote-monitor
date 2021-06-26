import e from "express"
import { db } from "./Database"

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

        db.run("UPDATE users SET admin = $admin WHERE username = $username", {
            $admin: admin,
            $username: this.username
        })
    }
}

export function getUserByUsername(username: string): Promise<User> {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = $username", {
            $username: username
        }, (err, value) => {
            if (err) {
                reject(err)
                return
            }

            if (value == undefined) {
                reject("There's no user with that username")
                return
            }

            resolve(new User(value.username, value.admin == 1, value.discordId))
        })
    })
}

export function checkPassword(username: string, password: string): Promise<User | null> {
    const hashed = hashPassword(password)

    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = $username", {
            $username: username
        }, (err, value) => {
            if (err) {
                reject(err)
                return
            }

            if (value == undefined) {
                reject("There's no user with that username")
                return
            }

            if (hashed != value.password) {
                resolve(null)
                return
            }

            resolve(new User(value.username, value.admin == 1, value.discordId))
        })
    })
}

export function createUser(username: string, password: string): Promise<User> {
    const hashed = hashPassword(password)

    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO users (
            username,
            password
        ) VALUES (
            $username,
            $password
        )`, {
            $username: username,
            $password: hashed
        }, (err) => {
            if (err) {
                reject(err)
                return
            }

            resolve(new User(username, false))
        })
    })
}

export function canCreateUser(username: string): Promise<true | string> {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE username = $username`, {
            $username: username
        }, (data) => {
            if (data != null) {
                resolve("That user already exists")
            }

            db.get(`SELECT * FROM settings ASC LIMIT 1`, (err, data) => {
                if (data.allowedUsers == null) {
                    resolve(true)
                    return
                }

                let allowedUsers: string[] = JSON.parse(data.allowedUsers)

                if (allowedUsers.includes(username)) {
                    resolve(true)
                    return
                }

                resolve("That username doesn't have permission to create an account")
            })
        })
    })
}

function hashPassword(password: string): string {
    // TODO: Use an actual hashing algorithm
    return password
}