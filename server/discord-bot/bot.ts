import { Client } from "discord.js"
import { logger } from "../index"
import { getSettings } from "../database/Settings"
import { onDirectMessage } from "./connectAccount"
import { DBGuild } from "../database/Discord"
import { commands } from "./commandHelpers"
import { PrefixCommand } from "./commands"
console.log(PrefixCommand)

export class DiscordBot {
    constructor() {
        this.client = new Client()

        this.login()

        this.client.on("message", msg => {
            if (msg.author.bot) return

            if (msg.guild == null) {
                onDirectMessage(msg)
                return
            }

            const guild = new DBGuild(msg.guild.id)
            const split = msg.content.split(" ")

            if (split.length < 2 || split[0] != guild.prefix) return

            if (!commands.has(split[1])) {
                msg.channel.send(`Couldn't find the command ${split[1]}`)
                return
            }

            commands.get(split[1])!.run(msg, split.slice(2))
        })
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
