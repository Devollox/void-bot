import 'dotenv/config'
import { Client, GatewayIntentBits } from 'discord.js'
import { loadEvents } from './handlers/events.js'
import { loadCommands } from './handlers/commands.js'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
})

await loadEvents(client)
await loadCommands(client)

client.login(process.env.DISCORD_TOKEN)
