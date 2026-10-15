import { ActivityType, Client } from 'discord.js'

export function updateRPC(client: Client<true>) {
	client.user.setPresence({
		activities: [
			{
				name: 'Looks into the Void',
				type: ActivityType.Watching,
			},
		],
		status: 'online',
	})
}
