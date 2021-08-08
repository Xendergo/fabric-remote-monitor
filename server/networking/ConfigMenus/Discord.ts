import { WsConnectionManager } from "../WsConnectionManager"
import { discordInput } from "../sendableTypes"
import { createDiscordBot, destroyDiscordBot } from "../.."
import { database } from "../../database/DatabaseManager"

export function discordListeners(user: WsConnectionManager) {
    user.listen(discordInput.fields.token, data => {
        database.setDiscordToken(data.value)

        destroyDiscordBot()

        createDiscordBot()
    })

    user.listen(discordInput.RequestDefault, data => {
        user.send(
            new discordInput.Everything({
                token: database.getSettings().discordToken,
            })
        )
    })
}
