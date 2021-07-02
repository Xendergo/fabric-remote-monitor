import { WsConnectionManager } from "../WsConnectionManager"
import { discordInput } from "../sendableTypes"
import { setDiscordToken, getSettings } from "../../database/Settings"

export function discordListeners(user: WsConnectionManager) {
    user.listen(discordInput.fields.token, data => {
        setDiscordToken(data.value)
    })

    user.listen(discordInput.RequestDefault, data => {
        console.log("Requested default")
        user.send(
            new discordInput.Everything({
                token: getSettings().discordToken,
            })
        )
    })
}
