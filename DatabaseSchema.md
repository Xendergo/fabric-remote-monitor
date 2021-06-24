# Tables
## Users
`users`
Data specific for every user that can access the website

Every user's username, must be the same as their minecraft username
`username: string, primary key, not null`

Every user's discord id
`discordId: integer, unique, default: null`

Every user's password hash
`password: string, not null`

User's admin status
`admin: bool, default: false`

## Settings
`settings`
Data specific to the whole server. 

Which users are allowed to make accounts on the website, by minecraft username, null means anyone can make an account.
`allowedUsers: json list, default: first user to make an account (in theory the server admin), can be null`

Whether to enable proximity chat
`proximityChat: bool, default: false`

Discord bot token, running a discord bot is disabled if this is null
`discordToken: string, default: null`

## Discord server settings
`guildSettings`
Data specific to each discord server the discord bot is in

The guild's id
`id: integer, primary key`

The channel where in game chat should be mirrored
`mirror: integer, can be null`

## Mods
`mods`
Data specific to each mod installed to the game

The link to where the mod can be downloaded (cursforge/github)
`source: string, not null`

The mod's file name in the mods folder
`file: string, not null`