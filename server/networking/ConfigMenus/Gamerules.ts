import { WsConnectionManager } from "../WsConnectionManager"
import { DefaultGamerules, Gamerules } from "../sendableTypes"
import { gamerules } from "../../mc-communication/gamerules"

export function gamerulesListeners(user: WsConnectionManager) {
    user.listen(DefaultGamerules, data => {
        user.send(gamerules ?? new Gamerules([]))
    })
}
