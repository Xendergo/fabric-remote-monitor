import ws from 'ws';
import { canCreateUser, checkPassword, User } from '../database/User';
import { WsConnectionManager } from './WsConnectionManager';
import { LoginDetails, LoginFailed, LoginSuccessful, SignupDetails } from './sendableTypes';

export class ConnectedUser {
    constructor(socket: ws) {
        this.socket = socket

        this.connectionManager = new WsConnectionManager(this.socket)

        this.connectionManager.listen("LoginDetails", async (data: LoginDetails) => {
            const maybeUser = await checkPassword(data.username, data.password)

            if (!maybeUser) {
                this.connectionManager.send(new LoginFailed())
                return
            }

            this.connectionManager.send(new LoginSuccessful())
            this.user = maybeUser
        })

        this.connectionManager.listen("SignupDetails", async (data: SignupDetails) => {
            console.log(await canCreateUser(data.username))
        })
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}