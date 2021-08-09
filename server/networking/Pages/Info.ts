import { CurrentPages, Pages } from "../sendableTypes"
import { pages, updatePages } from "../../database/Pages"
import { WsConnectionManager } from "../WsConnectionManager"
import { RegisterPage } from "./PageManager"

@RegisterPage("Info", false)
class InfoListeners {
    static addListeners(user: WsConnectionManager) {
        user.listen(CurrentPages, data => {
            user.send(pages)
        })
    }
}

@RegisterPage("Info Editor", true)
class InfoEditorListeners {
    static addListeners(user: WsConnectionManager) {
        user.listen(Pages, data => {
            updatePages(data)
        })
    }
}
