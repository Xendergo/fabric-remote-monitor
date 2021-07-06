import { WsConnectionManager } from "../WsConnectionManager"
import { discordInput } from "../sendableTypes"
import { setDiscordToken, getSettings } from "../../database/Settings"
import { createDiscordBot, destroyDiscordBot } from "../.."

export function discordListeners(user: WsConnectionManager) {
    user.listen(discordInput.fields.token, data => {
        setDiscordToken(data.value)

        destroyDiscordBot()

        createDiscordBot()
    })

    user.listen(discordInput.RequestDefault, data => {
        console.log("UYEYEYEYEY")
        user.send(
            new discordInput.Everything({
                token: getSettings().discordToken,
            })
        )
    })
}
