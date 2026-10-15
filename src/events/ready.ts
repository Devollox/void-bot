import { Client, Events } from 'discord.js'
import { updateStats } from '../services/stats'
import { setupRules } from '../services/rules'
import { updateRPC } from '../services/rpc'

export default {
	name: Events.ClientReady,
	execute(client: Client<true>) {
		console.log(`Logged in as ${client.user.tag}!`)

		void updateRPC(client)
		void updateStats(client)
		void setupRules(client)

		setInterval(
			() => {
				updateStats(client).catch(console.error)
			},
			10 * 60 * 1000
		)
	},
}
