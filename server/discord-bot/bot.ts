import { Client } from "discord.js"
import { logger } from "../index"
import { getSettings } from "../database/Settings"

export class DiscordBot {
    constructor() {
        this.client = new Client()

        this.login()
    }

    private async login() {
        try {
            await this.client.login(getSettings().discordToken)
        } catch {
            logger.error(
                "Failed to start the discord bot, most likely because the token inputted is invalid"
            )
        }

        logger.info("Started the discord bot")
    }

    logout() {
        this.client.destroy()
    }

    client: Client
}
