import { Message } from "discord.js"

type AllowedArgumentTypeNames = "string"
type AllowedArgumentTypes = string

type CommandArgumentGeneric<T extends AllowedArgumentTypeNames> = {
    type: T
    name: string
}

type CommandArgument = CommandArgumentGeneric<AllowedArgumentTypeNames>

interface DiscordCommandInterface<T extends AllowedArgumentTypes[]> {
    exec(msg: Message, args: T): void
}

abstract class DiscordCommand {
    abstract command: string
    abstract args: CommandArgument[]
    abstract exec(msg: Message, args: AllowedArgumentTypes[]): void

    run(msg: Message, args: string[]) {
        const converted = args.map((arg, i) => {
            if (this.args[i].type == "string") {
                return arg
            }

            return arg
        })

        if (this.args.length > args.length) {
            msg.channel.send(
                `You must include all arguments (${this.args
                    .map(v => v.name)
                    .join(", ")})`
            )

            return
        }

        this.exec(msg, converted)
    }
}

export const commands: Map<string, DiscordCommand> = new Map()

type ArgumentTypes<T extends AllowedArgumentTypes[]> = {
    +readonly [Property in keyof T]: CommandArgumentGeneric<
        T[Property] extends string | null ? "string" : never
    >
}

export function MakeCommand<T extends AllowedArgumentTypes[]>(
    command: string,
    args: ArgumentTypes<T>
) {
    return (target: { new (): DiscordCommandInterface<T> }) => {
        target.prototype.command = command
        target.prototype.args = Object.entries(args).map(
            ([, value]) => value
        ) as CommandArgument[]
        target.prototype.run = DiscordCommand.prototype.run

        commands.set(command, new target() as DiscordCommand)
    }
}
