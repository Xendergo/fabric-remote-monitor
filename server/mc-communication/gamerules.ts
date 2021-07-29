import { minecraftInterface } from "../index"
import { Gamerules } from "../networking/sendableTypes"

export let gamerules: Gamerules | null = null

minecraftInterface.listen(Gamerules, newGamerules => {
    gamerules = newGamerules
})
