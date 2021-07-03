import { Message } from "discord.js"
import { connectedUsers } from "../index"
import { ConnectedUser } from "../networking/ConnectedUser"
import { Popup } from "../networking/sendableTypes"

export async function onDirectMessage(msg: Message) {
    if (msg.content.toLowerCase() == "connect") {
        await connectAccount(msg)
    }
}

async function connectAccount(msg: Message) {
    msg.reply(
        "Make sure you're logged into your account on the website before responding"
    )
    msg.reply("What's your username?")

    let connectedUser: ConnectedUser | null = null

    while (connectedUser == null) {
        const userResponse = (
            await msg.channel.awaitMessages((v: Message) => !v.author.bot, {
                max: 1,
                time: 60000,
            })
        ).first()

        if (!userResponse) {
            msg.reply(
                "You didn't say anything, stopping account connection process"
            )
            return
        }

        connectedUsers.forEach(v => {
            if (v.user?.username == userResponse.content) {
                connectedUser = v
            }
        })

        if (connectedUser == null) {
            msg.reply(
                "There's no user with that username logged into the site, make sure you're logged in and there aren't typos"
            )
        }
    }

    msg.reply(
        "Sending a verification code to your screen, please send the code back"
    )

    const code = Math.floor(Math.random() * 1000000)
        .toString()
        .toLowerCase()

    connectedUser = connectedUser as ConnectedUser

    connectedUser.connectionManager.send(new Popup("Your code is...", code))

    const response = (
        await msg.channel.awaitMessages((v: Message) => !v.author.bot, {
            max: 1,
            time: 60000,
        })
    ).first()

    if (!response) {
        msg.reply(
            "You didn't say anything, stopping account connection process"
        )
        return
    }

    if (response.content != code) {
        msg.reply("That code is incorrect, stopping account connection process")
        return
    }

    connectedUser.user?.setDiscordId(msg.author.id)
    msg.reply("Your discord account has been successfully connected")
}
