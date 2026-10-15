import 'dotenv/config'
import { Client } from 'discord.js'
import { getGitHubData } from './github'

export async function updateStats(client: Client<true>) {
	if (!process.env.VERSION_VOICE_CHANNEL || !process.env.DOWNLOADS_VOICE_CHANNEL) return

	const VERSION_VOICE_CHANNEL = process.env.VERSION_VOICE_CHANNEL
	const DOWNLOADS_VOICE_CHANNEL = process.env.DOWNLOADS_VOICE_CHANNEL
	const { version, downloads } = await getGitHubData()

	const startChannel = await client.channels.fetch(VERSION_VOICE_CHANNEL)
	if (startChannel && 'setName' in startChannel) {
		await startChannel.setName(`version: ${version}`)
	}

	const usersChannel = await client.channels.fetch(DOWNLOADS_VOICE_CHANNEL)
	if (usersChannel && 'setName' in usersChannel) {
		await usersChannel.setName(`downloads: ${downloads}`)
	}
}
