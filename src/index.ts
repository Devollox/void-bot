import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from 'discord.js'

const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})

client.on(Events.ClientReady, () => {
	console.log(`Logged in as ${client.user?.tag}!`)
})

client.login(process.env.DISCORD_TOKEN)
