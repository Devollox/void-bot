import { Client, Collection } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function loadCommands(
	client: Client & { commands: Collection<string, any> },
) {
	const commandsPath = path.join(__dirname, '../commands')
	const files = fs
		.readdirSync(commandsPath)
		.filter(f => f.endsWith('.ts') || f.endsWith('.js'))

	for (const file of files) {
		const command = (await import(pathToFileURL(path.join(commandsPath, file)).href)).default
		client.commands.set(command.data.name, command)
	}
}
