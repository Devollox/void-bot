import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from 'discord.js'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
})

client.on(Events.ClientReady, () => {
	console.log(`Logged in as ${client.user?.tag}!`)
})

client.on(Events.GuildMemberAdd, member => {
	if (!process.env.START_DISCORD_ROLE) return

	member.roles.add(process.env.START_DISCORD_ROLE).catch(console.error)
})

client.login(process.env.DISCORD_TOKEN)
