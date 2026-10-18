import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getGitHubData } from '../services/github.js'

export default {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Show Void Presence server and release stats'),

	async execute(interaction: any) {
		await interaction.deferReply()

		const guild = interaction.guild
		const { version, downloads } = await getGitHubData()

		const memberCount = guild?.memberCount ?? 0
		const onlineCount =
			guild?.members.cache.filter((m: any) => m.presence?.status !== 'offline').size ?? 0

		const embed = new EmbedBuilder()
			.setColor(0x0a0a0a)
			.setTitle('Void Presence stats')
			.addFields(
				{ name: 'Members', value: `${memberCount}`, inline: true },
				{ name: 'Online', value: `${onlineCount}`, inline: true },
				{ name: 'Version', value: `v${version}`, inline: true },
				{ name: 'Downloads', value: `${downloads.toLocaleString()}`, inline: true }
			)
			.setFooter({ text: 'Void Presence' })
			.setTimestamp()

		await interaction.editReply({ embeds: [embed] })
	},
}
