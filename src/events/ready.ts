import { Client, Events } from 'discord.js'
import { updateStats } from '../services/stats'

export default {
	name: Events.ClientReady,
	execute(client: Client<true>) {
		console.log(`Logged in as ${client.user.tag}!`)

		void updateStats(client)

		setInterval(
			() => {
				updateStats(client).catch(console.error)
			},
			10 * 60 * 1000
		)
	},
}
