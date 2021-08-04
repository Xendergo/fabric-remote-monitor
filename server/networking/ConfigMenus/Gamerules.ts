import { WsConnectionManager } from "../WsConnectionManager"
import { DefaultGamerules, Gamerules, ChangeGamerule } from "../sendableTypes"
import { gamerules } from "../../mc-communication/gamerules"
import { minecraftInterface } from "../../index"

export function gamerulesListeners(user: WsConnectionManager) {
    user.listen(DefaultGamerules, data => {
        user.send(gamerules ?? new Gamerules([]))
    })

    user.listen(ChangeGamerule, data => {
        minecraftInterface.send(data)
    })
}
