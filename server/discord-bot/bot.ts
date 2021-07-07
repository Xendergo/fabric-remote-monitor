import { Client } from "discord.js"
import { logger, minecraftInterface } from "../index"
import { getSettings } from "../database/Settings"
import { onDirectMessage } from "./connectAccount"
import { DBGuild } from "../database/Discord"
import { commands } from "./commandHelpers"
import { PrefixCommand, MirrorCommand } from "./commands"
import { MirrorMessage, newStyle } from "../networking/sendableTypes"
import { broadcast } from "../networking/WsConnectionManager"
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

            if (guild.mirror == msg.channel.id) {
                const message = new MirrorMessage(
                    `<${msg.member?.displayName}> ${msg.content}`,
                    newStyle({})
                )

                broadcast(message)

                minecraftInterface.send(message)
            }

            const split = msg.content.split(" ")

            if (split.length < 2 || split[0] != guild.prefix) return

            if (!commands.has(split[1])) {
                msg.channel.send(`Couldn't find the command ${split[1]}`)
                return
            }

            commands.get(split[1])!.run(msg, split.slice(2))
        })
    }

    onMirrorMessage(msg: MirrorMessage) {
        this.client.guilds.cache.forEach(guild => {
            const dbGuild = new DBGuild(guild.id)

            const channel = guild.channels.cache.get(dbGuild.mirror)
            if (channel?.isText()) {
                channel.send(msg.message)
            }
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
