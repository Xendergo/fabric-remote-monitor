import ws from "ws"
import { checkPassword, User } from "../database/User"
import { broadcast, WsConnectionManager } from "./WsConnectionManager"
import {
    MirrorMessage,
    LoginDetails,
    LoginFailed,
    LoginSuccessful,
    GithubLink,
} from "./sendableTypes"
import { minecraftInterface } from ".."
import { discordBot } from "../index"
import { registeredPages } from "./Pages/PageManager"
import { database } from "../database/DatabaseManager"
import pkg from "../package.json"

export class ConnectedUser {
    constructor(socket: ws) {
        this.socket = socket

        this.connectionManager = new WsConnectionManager(this.socket, this)

        this.listen()
    }

    listen() {
        this.connectionManager.send(new GithubLink(pkg.repository.url))
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

                const disabledTabs = (await database.getSettings()).disabledTabs

                for (const page of registeredPages) {
                    if (
                        !disabledTabs.includes(page.name) &&
                        (!page.adminOnly || this.user.admin)
                    ) {
                        page.addListeners(this.connectionManager, this.user)
                    }
                }

                this.connectionManager.send(
                    new LoginSuccessful(await this.user.admin)
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

                discordBot?.onMirrorMessage(mirrorMessage)
            }
        )
    }

    socket: ws
    user: User | null = null
    connectionManager: WsConnectionManager
}
