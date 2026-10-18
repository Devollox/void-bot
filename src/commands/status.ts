import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { redis } from '../services/redis.js'

export default {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('Check current status of all Void Presence services'),

	async execute(interaction: any) {
		await interaction.deferReply()

		const checkWebhook = async (): Promise<{ ok: boolean; latency: number }> => {
			const start = Date.now()
			try {
				const res = await fetch('https://webhooks.voidpresence.com/health', {
					signal: AbortSignal.timeout(5000),
				})
				return { ok: res.ok, latency: Date.now() - start }
			} catch {
				return { ok: false, latency: -1 }
			}
		}

		const checkBot = async (): Promise<{ ok: boolean; latency: number }> => {
			const start = Date.now()
			const heartbeat = await redis.get<number>('bot:heartbeat')
			const latency = Date.now() - start
			if (!heartbeat) return { ok: false, latency }
			const age = Date.now() - heartbeat
			return { ok: age < 5 * 60 * 1000, latency }
		}

		const [webhook, bot] = await Promise.all([checkWebhook(), checkBot()])

		const statusLine = (ok: boolean, latency: number) =>
			ok ? `Operational · ${latency}ms` : 'Down'

		const allOk = webhook.ok && bot.ok

		const embed = new EmbedBuilder()
			.setColor(allOk ? 0x22c55e : 0xef4444)
			.setTitle('Service status')
			.addFields(
				{ name: 'Webhook Service', value: statusLine(webhook.ok, webhook.latency), inline: false },
				{ name: 'Discord Bot', value: statusLine(bot.ok, bot.latency), inline: false }
			)
			.setFooter({ text: 'status.voidpresence.com' })
			.setTimestamp()

		await interaction.editReply({ embeds: [embed] })
	},
}
