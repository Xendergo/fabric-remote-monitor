import { MakeServerStateSendable } from "./server-state"
import { Sendable } from "triangulum"

@MakeServerStateSendable("MinecraftInterfaceReady")
export class MinecraftInterfaceReady extends Sendable {}
