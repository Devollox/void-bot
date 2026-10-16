import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	Client,
	EmbedBuilder,
	TextChannel,
} from 'discord.js'

export async function setupRules(client: Client<true>) {
	if (!process.env.RULES_CHANNEL) return

	const channel = await client.channels.fetch(process.env.RULES_CHANNEL).catch(() => null)
	if (!channel || !(channel instanceof TextChannel)) return

	const messages = await channel.messages.fetch({ limit: 20 })
	const botMessages = messages.filter(m => m.author.id === client.user.id)
	for (const msg of botMessages.values()) {
		await msg.delete().catch(() => null)
	}

	const welcomeEmbed = new EmbedBuilder()
		.setColor(0x0a0a0a)
		.setAuthor({
			name: 'Void Presence',
			iconURL: client.user.displayAvatarURL(),
			url: 'https://voidpresence.com',
		})
		.setTitle('Welcome to the Void Presence community')
		.setDescription(
			'Advanced Discord Rich Presence manager.\nCustom profiles, status cycles, images, buttons and automatic media detection.'
		)
		.setImage('https://raw.githubusercontent.com/Devollox/void-web/main/public/preview.png')
		.setFooter({ text: 'voidpresence.com' })

	await channel.send({ embeds: [welcomeEmbed] })
	await new Promise(r => setTimeout(r, 500))

	const rulesEmbed = new EmbedBuilder()
		.setColor(0x111111)
		.setTitle('Server Rules')
		.setDescription(
			'**1.** Be respectful — no harassment, discrimination or personal attacks.\n\n' +
				'**2.** No spam, self-promotion or unsolicited DMs.\n\n' +
				'**3.** Keep discussions relevant to the channel topic.\n\n' +
				'**4.** No piracy, cracks or illegal content of any kind.\n\n' +
				"**5.** Follow Discord's [Terms of Service](https://discord.com/terms) and [Community Guidelines](https://discord.com/guidelines).\n\n" +
				'**6.** English only in public channels.'
		)

	await channel.send({ embeds: [rulesEmbed] })
	await new Promise(r => setTimeout(r, 500))

	const linksEmbed = new EmbedBuilder()
		.setColor(0x111111)
		.setTitle('Useful Links')
		.addFields({
			name: '',
			value:
				'[Download](https://voidpresence.com/download) · [Website](https://voidpresence.com) · [GitHub](https://github.com/Devollox/void-presence) · Support: <#' +
				process.env.TICKETS_CHANNEL +
				'>',
		})
		.setFooter({ text: 'Click the button below to accept the rules and gain access.' })

	const button = new ButtonBuilder()
		.setCustomId('accept_rules')
		.setLabel('I accept the rules')
		.setStyle(ButtonStyle.Success)

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

	await channel.send({ embeds: [linksEmbed], components: [row] })
}

export async function handleAcceptRules(interaction: ButtonInteraction) {
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
