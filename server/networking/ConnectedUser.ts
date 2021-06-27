import ws from "ws"
import { canCreateUser, checkPassword, User } from "../database/User"
import { broadcast, WsConnectionManager } from "./WsConnectionManager"
import {
    ClientMirrorMessage,
    MirrorMessage,
    LoginDetails,
    LoginFailed,
    LoginSuccessful,
    SignupDetails,
} from "./sendableTypes"

export class ConnectedUser {
    constructor(socket: ws) {
        this.socket = socket

        this.connectionManager = new WsConnectionManager(this.socket, this)

        this.connectionManager.listen(
            LoginDetails,
            async (data: LoginDetails) => {
                console.log(data)
                const maybeUser = await checkPassword(
                    data.username,
                    data.password
                )

                if (!maybeUser) {
                    this.connectionManager.send(new LoginFailed())
                    return
                }

                this.connectionManager.send(new LoginSuccessful())
                this.user = maybeUser
            }
        )

        this.connectionManager.listen(
            SignupDetails,
            async (data: SignupDetails) => {
                console.log(await canCreateUser(data.username))
            }
        )

        this.connectionManager.listen(
            ClientMirrorMessage,
            (data: ClientMirrorMessage) => {
                broadcast<MirrorMessage>(
                    new MirrorMessage(this.user!.username, data.message)
                )
            }
        )
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}
