import ws from "ws"
import { canCreateUser, checkPassword, User } from "../database/User"
import { broadcast, WsConnectionManager } from "./WsConnectionManager"
import {
    MirrorMessage,
    LoginDetails,
    LoginFailed,
    LoginSuccessful,
    SignupDetails,
} from "./sendableTypes"
import { minecraftInterface } from ".."

export class ConnectedUser {
    constructor(socket: ws) {
        this.socket = socket

        this.connectionManager = new WsConnectionManager(this.socket, this)

        this.connectionManager.listen(
            LoginDetails,
            async (data: LoginDetails) => {
                const maybeUser = await checkPassword(
                    data.username,
                    data.password
                )

                if (!maybeUser) {
                    this.connectionManager.send(new LoginFailed())
                    return
                }

                this.user = maybeUser
                this.connectionManager.send(
                    new LoginSuccessful(this.user.admin)
                )
            }
        )

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
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}
