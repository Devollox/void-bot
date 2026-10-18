import 'dotenv/config'
import { REST, Routes } from 'discord.js'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname } from 'path'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const commands = []
const commandsPath = path.join(__dirname, 'commands')
const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'))

for (const file of files) {
	const command = (await import(pathToFileURL(path.join(commandsPath, file)).href)).default
	if (command?.data) {
		commands.push(command.data.toJSON())
	}
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!)

console.log(`Registering ${commands.length} commands...`)

await rest.put(
	Routes.applicationCommands(process.env.DISCORD_BOT_ID!),
	{ body: commands }
)

console.log('Done!')
