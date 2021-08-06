import { CurrentPages } from "../sendableTypes"
import { pages } from "../../database/Pages"
import { WsConnectionManager } from "../WsConnectionManager"

export function infoListeners(user: WsConnectionManager) {
    user.listen(CurrentPages, data => {
        user.send(pages)
    })
}
