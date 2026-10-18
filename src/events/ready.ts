import { Client, Events } from 'discord.js'
import { updateStats } from '../services/stats.js'
import { setupRules } from '../services/rules.js'
import { updateRPC } from '../services/rpc.js'
import { ticketManager } from '../services/tickets.js'
import { redis, syncRegisteredUsers } from '../services/redis.js'

async function sendHeartbeat() {
	await redis.set('bot:heartbeat', Date.now(), { ex: 60 * 5 })
}

export default {
	name: Events.ClientReady,
	async execute(client: Client<true>) {
		console.log(`Logged in as ${client.user.tag}!`)

		void updateRPC(client)
		void setupRules(client)
		void syncRegisteredUsers(client)
		void ticketManager.setupTicketChannel(client)
		void ticketManager.loadTickets(client)
		void sendHeartbeat()

		setInterval(() => void sendHeartbeat(), 2 * 60 * 1000)

		let nextTask: 'stats' | 'tickets' = 'stats'

		setInterval(
			async () => {
				try {
					if (nextTask === 'stats') {
						await updateStats(client)
						nextTask = 'tickets'
					} else {
						await ticketManager.updateOpenTicketsChannel(client)
						nextTask = 'stats'
					}
				} catch (error) {
					console.error(error)
				}
			},
			10 * 60 * 1000
		)

		setInterval(
			async () => {
				await syncRegisteredUsers(client)
			},
			60 * 60 * 1000
		)
	},
}
