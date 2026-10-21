import type { Client } from 'discord.js'
import { sleep } from '../utils/async.js'
import { getErrorMessage } from '../utils/errors.js'

const RETRY_DELAYS = [5000, 15000, 30000, 60000, 120000, 300000] as const

let attempt = 0
let isReconnecting = false

export async function startBot(client: Client): Promise<void> {
	const token = process.env.DISCORD_TOKEN

	if (!token) {
		console.error('[bot] DISCORD_TOKEN is not set')
		process.exit(1)
	}

	try {
		await client.login(token)
		attempt = 0
		console.log('[bot] started successfully')
	} catch (error) {
		console.error('[bot] login failed:', getErrorMessage(error))
		await reconnectBot(client, 'login failed')
	}
}

export async function reconnectBot(client: Client, reason: string): Promise<void> {
	if (isReconnecting) return
	isReconnecting = true

	const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]
	attempt++

	console.error(`[bot] ${reason} — reconnect attempt #${attempt} in ${delay / 1000}s`)

	await sleep(delay)

	try {
		await client.destroy()
	} catch (error) {
		console.error('[bot] client destroy failed:', getErrorMessage(error))
	}

	isReconnecting = false

	const token = process.env.DISCORD_TOKEN

	if (!token) {
		console.error('[bot] DISCORD_TOKEN is not set')
		process.exit(1)
	}

	try {
		await client.login(token)
		attempt = 0
		console.log('[bot] reconnected successfully')
	} catch (error) {
		console.error('[bot] reconnect failed:', getErrorMessage(error))
		await reconnectBot(client, 'reconnect failed')
	}
}
