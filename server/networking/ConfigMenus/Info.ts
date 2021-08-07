import { CurrentPages, Pages, DeletePage } from "../sendableTypes"
import { pages, updatePage, deletePage } from "../../database/Pages"
import { WsConnectionManager } from "../WsConnectionManager"

export function infoListeners(user: WsConnectionManager) {
    user.listen(CurrentPages, data => {
        user.send(pages)
    })
}

export function infoEditorListeners(user: WsConnectionManager) {
    user.listen(Pages, data => {
        data.pages.forEach(page => {
            updatePage(page.id, page.data, page.title, page.ordinal)
        })
    })

    user.listen(DeletePage, data => {
        deletePage(data.id)
    })
}
