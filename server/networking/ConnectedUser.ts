import ws from 'ws';
import { checkPassword, User } from '../database/User';
import { WsConnectionManager } from './WsConnectionManager';
import { LoginDetails, LoginFailed, LoginSuccessful } from './sendableTypes';

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
    }

    socket: ws
    user?: User
    connectionManager: WsConnectionManager
}