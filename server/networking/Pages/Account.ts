import _ from "lodash"
import { User } from "../../database/User"
import { resetPassword, hideTabs } from "../sendableTypes"
import { WsConnectionManager } from "../WsConnectionManager"
import { RegisterPage } from "./PageManager"

@RegisterPage("Account", false)
class AccountListeners {
    static addListeners(connection: WsConnectionManager, user: User) {
        connection.listen(resetPassword.Everything, async data => {
            const err = await user.resetPassword(
                data.password ?? "",
                data.newPassword ?? ""
            )

            if (err) {
                connection.send(new resetPassword.Status("Error", err))
            } else {
                connection.send(
                    new resetPassword.Status(
                        "Success",
                        "Your password has been reset"
                    )
                )
            }
        })

        connection.listen(hideTabs.RequestDefault, async data => {
            let res = _.mapValues(hideTabs.fields, v => true)

            res = _.assign(
                res,
                _.mapValues(_.pick(res, await user.hiddenTabs), v => false)
            )

            connection.send(new hideTabs.Everything(res))
        })

        connection.listen(hideTabs.Everything, data => {
            user.hiddenTabs = _.keysIn(_.pickBy(data, value => value === false))
        })
    }
}
