import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Client,
	EmbedBuilder,
	GuildMember,
	PermissionFlagsBits,
	TextChannel,
} from 'discord.js'
import { ticketStore } from './database.js'

export class TicketManager {
	async setupTicketChannel(client: Client<true>) {
		if (!process.env.TICKETS_CHANNEL) return

		const channel = await client.channels.fetch(process.env.TICKETS_CHANNEL).catch(() => null)

		if (!channel || !(channel instanceof TextChannel)) return

		const messages = await channel.messages.fetch({ limit: 10 })
		const existing = messages.find(message => message.author.id === client.user.id)

		if (existing) {
			await existing.delete().catch(() => null)
		}

		const embed = new EmbedBuilder()
			.setColor(0x0a0a0a)
			.setTitle('Support')
			.setDescription(
				'Need help with Void Presence? Open a ticket and our team will assist you.\n\n' +
					'Before creating a ticket, please check:\n' +
					'> · [Documentation](https://voidpresence.com/docs)\n' +
					'> · [GitHub Issues](https://github.com/Devollox/void-presence/issues)\n' +
					'> · [FAQ](https://voidpresence.com)'
			)
			.addFields({
				name: 'Response time',
				value: 'We typically respond within 24 hours.',
			})
			.setFooter({ text: 'One ticket per issue · Be descriptive' })

		const button = new ButtonBuilder()
			.setCustomId('create_ticket')
			.setLabel('Open a ticket')
			.setStyle(ButtonStyle.Secondary)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button)

		await channel.send({
			embeds: [embed],
			components: [row],
		})
	}

	async loadTickets(client: Client<true>) {
		await ticketStore.load()

		const guild = client.guilds.cache.first()
		if (!guild) return

		const channels = await guild.channels.fetch()

		const channelIds = new Set(channels.map(channel => channel?.id).filter(Boolean) as string[])

		await ticketStore.cleanup(channelIds)
	}

	async createTicket(client: Client<true>, member: GuildMember) {
		if (!member.guild) return null

		const existing = ticketStore.getOpenTicket(member.guild.id, member.id)

		if (existing) {
			return existing.channelId
		}

		const modRole = process.env.MOD_DISCORD_ROLE
		const devRole = process.env.DEV_DISCORD_ROLE

		const channel = await member.guild.channels.create({
			name: `ticket-${member.user.username}`,
			type: ChannelType.GuildText,
			parent: process.env.TICKETS_CATEGORY,
			permissionOverwrites: [
				{
					id: member.guild.id,
					deny: [PermissionFlagsBits.ViewChannel],
				},
				{
					id: member.id,
					allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
				},
				...(modRole
					? [
							{
								id: modRole,
								allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
							},
						]
					: []),
				...(devRole
					? [
							{
								id: devRole,
								allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
							},
						]
					: []),
			],
		})

		await ticketStore.create({
			guildId: member.guild.id,
			userId: member.id,
			channelId: channel.id,
		})

		// this.updateOpenTicketsChannel(client)

		return channel.id
	}

	async sendTicketWelcomeMessage(channelId: string, member: GuildMember) {
		const channel = await member.guild.channels.fetch(channelId).catch(() => null)

		if (!channel || !(channel instanceof TextChannel)) return

		const modRole = process.env.MOD_DISCORD_ROLE
		const devRole = process.env.DEV_DISCORD_ROLE

		const embed = new EmbedBuilder()
			.setColor(0x0a0a0a)
			.setTitle('Support ticket')
			.setDescription(
				`Hey ${member}, thanks for reaching out.\n\n` +
					'Please describe your issue in detail:\n' +
					'> · What are you trying to do?\n' +
					'> · What is happening instead?\n' +
					'> · Any error messages or screenshots?\n\n' +
					'A team member will be with you shortly.'
			)
			.setFooter({ text: `Ticket opened by ${member.user.username}` })
			.setTimestamp()

		const closeButton = new ButtonBuilder()
			.setCustomId('close_ticket')
			.setLabel('Close ticket')
			.setStyle(ButtonStyle.Danger)

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton)

		const mentions = [devRole ? `<@&${devRole}>` : null, modRole ? `<@&${modRole}>` : null]
			.filter(Boolean)
			.join(' ')

		await channel.send({
			content: mentions || undefined,
			embeds: [embed],
			components: [row],
		})
	}

	async closeTicket(client: Client<true>, channelId: string, closedBy: string) {
		const channel = await client.channels.fetch(channelId).catch(() => null)

		if (!channel || !(channel instanceof TextChannel)) return

		await ticketStore.close(channelId)

		const embed = new EmbedBuilder()
			.setColor(0x111111)
			.setDescription(`Ticket closed by <@${closedBy}>. This channel will be deleted in 5 seconds.`)

		await channel.send({ embeds: [embed] })

		await new Promise(resolve => setTimeout(resolve, 5000))

		await channel.delete().catch(() => null)

		// await this.updateOpenTicketsChannel(client)
	}

	isOpen(guildId: string, userId: string) {
		return Boolean(ticketStore.getOpenTicket(guildId, userId))
	}

	getTicketChannelId(guildId: string, userId: string) {
		return ticketStore.getOpenTicket(guildId, userId)?.channelId ?? null
	}

	async updateOpenTicketsChannel(client: Client<true>) {
		if (!process.env.OPEN_TICKETS_VOICE_CHANNEL || !process.env.TICKETS_CATEGORY) return

		const voiceChannel = await client.channels
			.fetch(process.env.OPEN_TICKETS_VOICE_CHANNEL)
			.catch(() => null)

		if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) return

		const category = await client.channels.fetch(process.env.TICKETS_CATEGORY).catch(() => null)

		let ticketsCount = 0

		if (category && category.type === ChannelType.GuildCategory) {
			ticketsCount = category.children.cache.filter(child => child.id !== voiceChannel.id).size
		}

		await voiceChannel.setName(`open tickets: ${ticketsCount - 1}`).catch(() => null)
	}
}

export const ticketManager = new TicketManager()
