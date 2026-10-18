import { Redis } from '@upstash/redis'
import { Client } from 'discord.js'

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
})

export async function syncRegisteredUsers(client: Client<true>) {
	const guild = client.guilds.cache.first()
	if (!guild || !process.env.REGISTERED_DISCORD_ROLE) return

	const members = await guild.members.fetch()
	const registeredRole = process.env.REGISTERED_DISCORD_ROLE

	for (const member of members.values()) {
		const hasKey = await redis.exists(`user:account:discord:${member.user.id}`)
		if (hasKey && !member.roles.cache.has(registeredRole)) {
			await member.roles.add(registeredRole)
		}
	}
}
