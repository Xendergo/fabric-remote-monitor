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
import { discordInput } from "./sendableTypes"

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

        this.connectionManager.listen(discordInput.fields.token, msg => {
            console.log(msg.value)
        })
        this.connectionManager.listen(discordInput.fields.bool, msg => {
            console.log(msg.value)
        })
        this.connectionManager.listen(discordInput.fields.num, msg => {
            console.log(msg.value)
        })
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}
