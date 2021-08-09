import _ from "lodash"
import { User } from "../../database/User"
import { resetPassword, hideTabs } from "../sendableTypes"
import { WsConnectionManager } from "../WsConnectionManager"

export function accountListeners(connection: WsConnectionManager, user: User) {
    connection.listen(resetPassword.Everything, data => {
        const err = user.resetPassword(
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

    connection.listen(hideTabs.RequestDefault, data => {
        let res = _.mapValues(hideTabs.fields, v => true)

        res = _.assign(
            res,
            _.mapValues(_.pick(res, user.hiddenTabs), v => false)
        )

        connection.send(new hideTabs.Everything(res))
    })

    connection.listen(hideTabs.Everything, data => {
        user.setHiddenTabs(_.keysIn(_.pickBy(data, value => value === false)))
    })
}
