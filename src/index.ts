import 'dotenv/config'
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import { loadEvents } from './handlers/events'
import { loadCommands } from './handlers/commands'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
})

client.commands = new Collection()

await loadEvents(client)
await loadCommands(client)

client.login(process.env.DISCORD_TOKEN)
