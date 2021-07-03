import { User } from "../../database/User"
import { resetPassword } from "../sendableTypes"
import { WsConnectionManager } from "../WsConnectionManager"

export function accountListeners(connection: WsConnectionManager, user: User) {
    connection.listen(resetPassword.Everything, data => {
        const err = user.resetPassword(
            data.password ?? "",
            data.newPassword ?? ""
        )

        if (err) {
            connection.send(new resetPassword.Response("Error", err))
        } else {
            connection.send(
                new resetPassword.Response(
                    "Success",
                    "Your password has been reset"
                )
            )
        }
    })
}
