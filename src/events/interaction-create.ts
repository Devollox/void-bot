import { ButtonInteraction, Events, Interaction } from 'discord.js'

export default {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (!interaction.isButton()) return

		if (interaction.customId === 'accept_rules') {
			await handleAcceptRules(interaction)
		}
	},
}

async function handleAcceptRules(interaction: ButtonInteraction) {
	const member = interaction.member
	if (!member || !interaction.guild) {
		await interaction.reply({ content: 'Could not find your member data.', ephemeral: true })
		return
	}

	const startRole = process.env.START_DISCORD_ROLE
	const userRole = process.env.USERS_DISCORD_ROLE

	if (!startRole || !userRole) {
		await interaction.reply({ content: 'Role configuration error.', ephemeral: true })
		return
	}

	try {
		const guildMember = await interaction.guild.members.fetch(interaction.user.id)

		if (guildMember.roles.cache.has(userRole)) {
			await interaction.reply({ content: 'You already have access.', ephemeral: true })
			return
		}

		await guildMember.roles.remove(startRole).catch(() => null)
		await guildMember.roles.add(userRole)

		await interaction.reply({
			content: 'Welcome! You now have access to the server.',
			ephemeral: true,
		})
	} catch (err) {
		console.error('Error handling accept_rules:', err)
		await interaction.reply({ content: 'Something went wrong. Please try again.', ephemeral: true })
	}
}
