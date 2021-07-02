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
import { discordListeners } from "./ConfigMenus/Discord"

export class ConnectedUser {
    constructor(socket: ws) {
        this.socket = socket

        this.connectionManager = new WsConnectionManager(this.socket, this)

        this.connectionManager.listen(LoginDetails, (data: LoginDetails) => {
            const maybeUser = checkPassword(data.username, data.password)

            if (!maybeUser) {
                this.connectionManager.send(new LoginFailed())
                return
            }

            this.user = maybeUser
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
            }
        )

        discordListeners(this.connectionManager)
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}
