import { Events, Message } from 'discord.js'
import { updateStats } from '../services/stats'

export default {
	name: Events.MessageCreate,
	async execute(message: Message) {
		if (message.channelId === process.env.RELEASES_CHANNEL) {
			void updateStats(message.client)
		}
	},
}
