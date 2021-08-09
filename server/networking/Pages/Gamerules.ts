import { WsConnectionManager } from "../WsConnectionManager"
import { DefaultGamerules, Gamerules, ChangeGamerule } from "../sendableTypes"
import { gamerules } from "../../mc-communication/gamerules"
import { minecraftInterface } from "../../index"
import { RegisterPage } from "./PageManager"

@RegisterPage("Gamerules", true)
class GamerulesListeners {
    static addListeners(user: WsConnectionManager) {
        user.listen(DefaultGamerules, data => {
            user.send(gamerules ?? new Gamerules([]))
        })

        user.listen(ChangeGamerule, data => {
            minecraftInterface.send(data)
        })
    }
}
