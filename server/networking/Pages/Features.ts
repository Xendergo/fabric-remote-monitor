import { RegisterPage } from "./PageManager"
import { WsConnectionManager } from "../WsConnectionManager"
import { disableTabs } from "../sendableTypes"
import _ from "lodash"
import { database } from "../../database/DatabaseManager"

@RegisterPage("Features", true)
class FeaturesListeners {
    static addListeners(connection: WsConnectionManager) {
        connection.listen(disableTabs.RequestDefault, data => {
            let res = _.mapValues(disableTabs.fields, v => true)

            res = _.assign(
                res,
                _.mapValues(
                    _.pick(res, database.getSettings().disabledTabs),
                    v => false
                )
            )

            connection.send(new disableTabs.Everything(res))
        })

        connection.listen(disableTabs.Everything, data => {
            database.setDisabledTabs(
                _.keysIn(_.pickBy(data, value => value === false))
            )
        })
    }
}
