import { MakeSendableWithData, Sendable, strats, Registry } from "triangulum"
import {
    MirrorMessage,
    Gamerules,
    ChangeGamerule,
} from "../networking/sendableTypes"
import { int, TagType } from "./nbt"

export const nbtRegistry = new Registry<
    NbtSendable,
    [(data: Map<string, TagType>) => boolean],
    (data: Map<string, TagType>) => NbtSendable
>()

/**
 * A class representing a class that can be sent via websockets or NBT
 */
export abstract class NbtSendable extends Sendable {
    /**
     * Encode this class as an NBT compound
     */
    abstract encode(): Map<string, TagType>
}

/**
 * A decorator to make a class sendable via NBT or websockets
 * @param channel The channel this class should be send through
 * @param decode A function to decode an NBT compound to the class
 */
export function MakeNbtSendable<T extends NbtSendable>(
    channel: string,
    theseStrats: [(data: TagType) => boolean]
) {
    return (constructor: {
        new (...args: any[]): T
        channel(): string
        decode(data: Map<string, TagType>): T
    }) => {
        MakeSendableWithData(
            nbtRegistry,
            channel,
            theseStrats,
            constructor.decode
        )(constructor)
    }
}

@MakeNbtSendable<SignupDetails>("SignupDetails", [
    strats.mapEach([
        ["username", strats.string],
        ["password", strats.string],
    ]),
])
export class SignupDetails extends NbtSendable {
    constructor(username: string, password: string) {
        super()
        this.username = username
        this.password = password
    }

    username: string
    password: string

    encode() {
        return new Map(Object.entries(this))
    }

    static decode(data: Map<string, TagType>) {
        return new SignupDetails(
            data.get("username")! as string,
            data.get("password")! as string
        )
    }
}

MakeNbtSendable("Gamerules", [
    strats.mapEach([
        [
            "gamerules",
            strats.Array(
                strats.mapEach([
                    ["name", strats.string],
                    ["default", strats.string],
                ])
            ),
        ],
    ]),
])(Gamerules)

MakeNbtSendable("MirrorMessage", [
    strats.mapEach<string, TagType>([
        ["message", strats.string],
        [
            "style",
            strats.each<int>({
                value: strats.bigint,
                type: strats.value("int"),
            }),
        ],
    ]),
])(MirrorMessage)

MakeNbtSendable("ChangeGamerule", [
    strats.mapEach<string, TagType>([
        ["gamerule", strats.string],
        ["value", strats.string],
    ]),
])(ChangeGamerule)
