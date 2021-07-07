import { Message } from "discord.js"
import { DBGuild } from "../database/Discord"
import { MakeCommand } from "./commandHelpers"

@MakeCommand<[string]>("prefix", [
    {
        type: "string",
        name: "prefix",
    },
])
export class PrefixCommand {
    exec(msg: Message, args: [string]) {
        const guild = new DBGuild(msg.guild!.id)

        guild.setPrefix(args[0])
    }
}

@MakeCommand<[]>("setMirror", [], true)
export class MirrorCommand {
    exec(msg: Message, args: []) {
        const guild = new DBGuild(msg.guild!.id)

        guild.setMirror(msg.channel.id)
        console.log("bruh")
    }
}
