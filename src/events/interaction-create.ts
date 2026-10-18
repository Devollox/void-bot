import { ButtonInteraction, ChatInputCommandInteraction, Events, Interaction } from 'discord.js'
import { ticketManager } from '../services/tickets.js'
import { handleAcceptRules } from '../services/rules.js'

export default {
	name: Events.InteractionCreate,
	async execute(interaction: Interaction) {
		if (interaction.isChatInputCommand()) {
			const commandInteraction = interaction as ChatInputCommandInteraction
			const command = (interaction.client as any).commands?.get(commandInteraction.commandName)
			if (!command) return
			try {
				await command.execute(commandInteraction)
			} catch (error) {
				console.error(error)
				if (commandInteraction.deferred || commandInteraction.replied) {
					await commandInteraction.editReply({ content: 'An error occurred.' })
				} else {
					await commandInteraction.reply({ content: 'An error occurred.', ephemeral: true })
				}
			}
			return
		}

		if (!interaction.isButton()) return

		const buttonInteraction = interaction as ButtonInteraction

		if (buttonInteraction.customId === 'accept_rules') {
			await handleAcceptRules(buttonInteraction)
			return
		}

		if (buttonInteraction.customId === 'create_ticket') {
			if (!buttonInteraction.inGuild()) return

			const member = await buttonInteraction.guild?.members.fetch(buttonInteraction.user.id)

			if (!member) return

			const existingChannelId = ticketManager.getTicketChannelId(
				buttonInteraction.guildId,
				member.id
			)

			if (existingChannelId) {
				await buttonInteraction.reply({
					content: `You already have an open ticket: <#${existingChannelId}>`,
					ephemeral: true,
				})
				return
			}

			await buttonInteraction.deferReply({ ephemeral: true })

			try {
				const channelId = await ticketManager.createTicket(buttonInteraction.client, member)

				if (!channelId) {
					await buttonInteraction.editReply({
						content: 'Failed to create a ticket. Please try again later.',
					})
					return
				}

				await buttonInteraction.editReply({
					content: `Ticket created: <#${channelId}>`,
				})

				await ticketManager.sendTicketWelcomeMessage(channelId, member)
			} catch (error) {
				console.error('Ticket creation error:', error)

				await buttonInteraction.editReply({
					content: 'Failed to create a ticket. Please try again later.',
				})
			}

			return
		}

		if (buttonInteraction.customId === 'close_ticket') {
			await ticketManager.closeTicket(
				buttonInteraction.client,
				buttonInteraction.channelId,
				buttonInteraction.user.id
			)
		}
	},
}
