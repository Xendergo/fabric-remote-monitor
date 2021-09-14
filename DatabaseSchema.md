For any setting that could be null, the key not existing should be taken as null

# Settings

Settings are stored just on redis's global hashmap

Which users are allowed to make accounts on the website, by minecraft username, null means anyone can make an account.
`allowedUsers: json list, default: first user to make an account (in theory the server admin), can be null`

Whether to enable proximity chat
`proximityChat: bool, default: false`

Discord bot token, running a discord bot is disabled if this is null
`discordToken: string, default: null`

Which tabs are disabled for all users, `/` seperated
`disabledTabs: string, not null, default: ""`

# Sets & incrementers

The keys in the sets don't include prefixes

## `users`

A set of all the users by username

## `pages`

A set of all the pages in the info tab by a unique id

## `pages_id_inc`

A number that represents the id of the next page to get added, incremented for every new page

# Data types

## `user`

Data specific for every user that can access the website

prefixed with `user_`, keyed by username

Every user's username, must be the same as their minecraft username
`username: string, primary key, not null`

Every user's discord id
`discordId: integer, unique, default: null`

Every user's password hash
`password: string, not null`

User's admin status
`admin: "true" | "false", default: false`

The user's hidden tabs, `/` seperated
`hiddenTabs: string, not null, default: ""`

## `guild`

Data specific to each discord server the discord bot is in

prefixed with `guild_`, keyed by id

The discord bot's prefix
`prefix: string, default: "mc"`

The channel where in game chat should be mirrored
`mirror: integer, can be null`

## `page`

Markdown for the information pages shown on the info tab

prefixed with `page_`, keyed by id

The order in which the pages should be shown in the tabs
`ordinal: integer, not null`

The title of the page
`title: string`

The content of the page in markdown
`data: string, not null`
