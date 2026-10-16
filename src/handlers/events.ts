import { Client } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadEvents(client: Client) {
	const eventsPath = path.join(__dirname, '../events')
	const files = fs.readdirSync(eventsPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'))

	for (const file of files) {
		const event = (await import(pathToFileURL(path.join(eventsPath, file)).href)).default

		if (!event) {
			return
		}

		client.on(event.name, event.execute)
	}
}
