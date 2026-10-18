import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getGitHubData } from '../services/github.js'

export default {
	data: new SlashCommandBuilder()
		.setName('download')
		.setDescription('Get the latest Void Presence download link'),

	async execute(interaction: any) {
		await interaction.deferReply()

		const { version } = await getGitHubData()

		const embed = new EmbedBuilder()
			.setColor(0x0a0a0a)
			.setTitle('Void Presence')
			.setDescription(
				`Latest release **v${version}**\n\n` +
					'> [Download](https://github.com/Devollox/void-presence/releases/latest)\n' +
					'> [View on GitHub](https://github.com/Devollox/void-presence)\n' +
					'> [Documentation](https://voidpresence.com/docs)'
			)
			.setFooter({ text: 'Void Presence' })
			.setTimestamp()

		await interaction.editReply({ embeds: [embed] })
	},
}
