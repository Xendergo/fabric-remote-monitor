import { minecraftInterface } from "../index"
import { Gamerules, ChangeGamerule } from "../networking/sendableTypes"
import { serverStateManager } from "../server-state/server-state"
import { MinecraftInterfaceReady } from "../server-state/serverStateMessages"
import { broadcast } from "../networking/WsConnectionManager"

export let gamerules: Gamerules | null = null

serverStateManager.listen(MinecraftInterfaceReady, data => {
    minecraftInterface.listen(Gamerules, newGamerules => {
        gamerules = newGamerules
    })

    minecraftInterface.listen(ChangeGamerule, changedGamerule => {
        gamerules?.gamerules.forEach(gamerule => {
            if (gamerule.name === changedGamerule.gamerule) {
                gamerule.default = changedGamerule.value
            }
        })

        broadcast(changedGamerule)
    })
})
