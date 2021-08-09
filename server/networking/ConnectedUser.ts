import ws from "ws"
import { checkPassword, User } from "../database/User"
import { broadcast, WsConnectionManager } from "./WsConnectionManager"
import {
    MirrorMessage,
    LoginDetails,
    LoginFailed,
    LoginSuccessful,
} from "./sendableTypes"
import { minecraftInterface } from ".."
import { discordBot } from "../index"
import { registeredPages } from "./Pages/PageManager"

export class ConnectedUser {
    constructor(socket: ws) {
        this.socket = socket

        this.connectionManager = new WsConnectionManager(this.socket, this)

        this.listen()
    }

    listen() {
        this.connectionManager.listen(LoginDetails, (data: LoginDetails) => {
            const maybeUser = checkPassword(data.username, data.password)

            if (!maybeUser) {
                this.connectionManager.send(new LoginFailed())
                return
            }

            this.user = maybeUser

            for (const page of registeredPages) {
                if (!page.adminOnly || this.user.admin) {
                    page.addListeners(this.connectionManager, this.user)
                }
            }

            this.connectionManager.send(new LoginSuccessful(this.user.admin))
        })

        this.connectionManager.listen(
            MirrorMessage,
            (mirrorMessage: MirrorMessage) => {
                mirrorMessage.message = `<${this.user!.username}> ${
                    mirrorMessage.message
                }`
                broadcast<MirrorMessage>(mirrorMessage)

                minecraftInterface.send(mirrorMessage)

                discordBot?.onMirrorMessage(mirrorMessage)
            }
        )
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}
