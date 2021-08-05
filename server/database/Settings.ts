import { db } from "./Database"

const selectSettings = db.prepare(`SELECT * FROM settings ASC LIMIT 1`)
const updateToken = db.prepare<{ newToken: string | null }>(
    `UPDATE settings SET discordToken = $newToken`
)

interface Settings {
    allowedUsers: string[] | null
    proximityChat: boolean
    discordToken: string
}

export function getSettings() {
    const settings = selectSettings.get()

    return {
        allowedUsers: JSON.parse(settings.allowedUsers),
        proximityChat: settings.proximityChat != 0,
        discordToken: settings.discordToken,
    } as Settings
}

export function setDiscordToken(newToken: string | null) {
    updateToken.run({
        newToken: newToken,
    })
}
