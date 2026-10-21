import 'dotenv/config'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import { loadEvents } from './handlers/events.js'
import { loadCommands } from './handlers/commands.js'
import { startBot } from './core/bot.js'
import { getErrorMessage } from './utils/errors.js'

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
	],
})

client.once(Events.ClientReady, (readyClient): void => {
	console.log(`[bot] logged in as ${readyClient.user.tag}`)
})

client.on(Events.ShardDisconnect, (...args): void => {
	const [event, shardId] = args as [unknown, number]

	console.warn(`[bot] shard #${shardId} disconnected:`, getErrorMessage(event))
})

client.on(Events.ShardReconnecting, (shardId: number): void => {
	console.warn(`[bot] shard #${shardId} reconnecting`)
})

client.on(Events.ShardResume, (...args): void => {
	const [, shardId] = args as [unknown, number]

	console.log(`[bot] shard #${shardId} resumed`)
})

client.on(Events.ShardError, (error: Error, shardId: number): void => {
	console.error(`[bot] shard #${shardId} error:`, getErrorMessage(error))
})

client.on(Events.Error, (error: Error): void => {
	console.error('[bot] client error:', getErrorMessage(error))
})

process.on('unhandledRejection', (reason: unknown): void => {
	console.error('[bot] unhandledRejection:', getErrorMessage(reason))
})

process.on('uncaughtException', (error: Error): void => {
	console.error('[bot] uncaughtException:', getErrorMessage(error))
	process.exit(1)
})

await loadEvents(client)
await loadCommands(client)
await startBot(client)
