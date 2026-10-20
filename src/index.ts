import 'dotenv/config'
import { Client, GatewayIntentBits, Events } from 'discord.js'
import { loadEvents } from './handlers/events.js'
import { loadCommands } from './handlers/commands.js'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
})

const RETRY_DELAYS: readonly number[] = [5000, 15000, 30000, 60000, 120000, 300000]

let attempt = 0
let isStarting = false

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

const getErrorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err))

async function start(): Promise<void> {
	if (isStarting) return
	isStarting = true

	try {
		await loadEvents(client)
		await loadCommands(client)

		const token = process.env.DISCORD_TOKEN
		if (!token) {
			throw new Error('DISCORD_TOKEN is not set in .env')
		}

		await client.login(token)
		attempt = 0
		console.log('[bot] started successfully')
	} catch (err) {
		console.error('[bot] startup error:', getErrorMessage(err))
		await retry('login failed')
	} finally {
		isStarting = false
	}
}

async function retry(reason: string): Promise<void> {
	const wait = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]
	attempt++
	console.error(`[bot] ${reason} — attempt #${attempt} in ${wait / 1000}s`)

	await sleep(wait)

	try {
		await client.destroy()
	} catch {}

	start()
}

client.on(Events.Error, (err: Error) => {
	console.error('[bot] client error:', err.message)
	void retry('client error')
})

client.on(Events.ShardError, (err: Error, shardId: number) => {
	console.error(`[bot] shard #${shardId} error:`, err.message)
	void retry('shard error')
})

process.on('unhandledRejection', (reason: unknown) => {
	console.error('[bot] unhandledRejection:', getErrorMessage(reason))
	void retry('unhandledRejection')
})

process.on('uncaughtException', (err: Error) => {
	console.error('[bot] uncaughtException:', err.message)
	void retry('uncaughtException')
})

start()
