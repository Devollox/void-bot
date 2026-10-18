import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import { ticketManager } from '../services/tickets.js'

export default {
	data: new SlashCommandBuilder()
		.setName('close-ticket')
		.setDescription('Close the current support ticket')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction: any) {
		await interaction.deferReply({ ephemeral: true })

		const channelId = interaction.channelId

		if (!ticketManager.isTicketChannel(channelId)) {
			await interaction.editReply({ content: 'This channel is not a ticket.' })
			return
		}

		await interaction.editReply({ content: 'Closing ticket…' })

		await ticketManager.closeTicket(interaction.client, channelId, interaction.user.id)
	},
}
