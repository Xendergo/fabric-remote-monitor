import { CurrentPages, Pages } from "../sendableTypes"
import { pages, updatePages } from "../../database/Pages"
import { WsConnectionManager } from "../WsConnectionManager"

export function infoListeners(user: WsConnectionManager) {
    user.listen(CurrentPages, data => {
        user.send(pages)
    })
}

export function infoEditorListeners(user: WsConnectionManager) {
    user.listen(Pages, data => {
        updatePages(data)
    })
}
