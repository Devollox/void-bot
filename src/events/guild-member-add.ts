import { Events, GuildMember } from 'discord.js'

export default {
	name: Events.GuildMemberAdd,
	execute(member: GuildMember) {
		if (!process.env.START_DISCORD_ROLE) return

		member.roles.add(process.env.START_DISCORD_ROLE).catch(console.error)
	},
}
