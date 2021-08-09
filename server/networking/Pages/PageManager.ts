import { WsConnectionManager } from "../WsConnectionManager"
import { User } from "../../database/User"

interface RegisteredPage {
    name: string
    adminOnly: boolean
    addListeners(connection: WsConnectionManager, user: User): void
}

export const registeredPages: RegisteredPage[] = []

export function RegisterPage(name: string, adminOnly: boolean) {
    return function (constructor: {
        addListeners(connection: WsConnectionManager, user: User): void
    }) {
        registeredPages.push({
            name,
            adminOnly,
            addListeners: constructor.addListeners,
        })
    }
}

import "./Account"
import "./Discord"
import "./Gamerules"
import "./Info"
