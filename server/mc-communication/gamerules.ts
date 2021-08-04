import { minecraftInterface } from "../index"
import { Gamerules } from "../networking/sendableTypes"
import { serverStateManager } from "../server-state/server-state"
import { MinecraftInterfaceReady } from "../server-state/serverStateMessages"

export let gamerules: Gamerules | null = null

serverStateManager.listen(MinecraftInterfaceReady, data => {
    minecraftInterface.listen(Gamerules, newGamerules => {
        gamerules = newGamerules
    })
})
