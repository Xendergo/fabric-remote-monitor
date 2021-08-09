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

The user's hidden pages, `/` seperated
`hiddenPages: string, not null, default: ""`

## Settings

`settings`
Data specific to the whole server.

Which users are allowed to make accounts on the website, by minecraft username, null means anyone can make an account.
`allowedUsers: json list, default: first user to make an account (in theory the server admin), can be null`

Whether to enable proximity chat
`proximityChat: bool, default: false`

Discord bot token, running a discord bot is disabled if this is null
`discordToken: string, default: null`

Which pages are disabled for all users, `/` seperated
`disabledPages: string, not null, default: ""`

## Discord server settings

`guilds`
Data specific to each discord server the discord bot is in

The guild's id
`id: integer, primary key`

The discord bot's prefix
`prefix: string, default: "mc"`

The channel where in game chat should be mirrored
`mirror: integer, can be null`

## Pages

`pages`
Markdown for the information pages shown on the info tab

A unique id for each page
`id: integer, primary key`

The order in which the pages should be shown in the tabs
`ordinal: integer, not null`

The title of the page
`title: string`

The content of the page in markdown
`data: string, not null`
