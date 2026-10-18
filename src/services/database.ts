import { readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import path from 'node:path'

type TicketStatus = 'OPEN' | 'CLOSED'

interface Ticket {
	guildId: string
	userId: string
	channelId: string
	status: TicketStatus
	createdAt: string
	closedAt?: string
}

export class TicketStore {
	private tickets: Ticket[] = []
	private readonly file = path.resolve(process.cwd(), 'data', 'tickets.json')

	async load() {
		try {
			const raw = await readFile(this.file, 'utf8')
			this.tickets = JSON.parse(raw).tickets ?? []
		} catch {
			this.tickets = []
		}
	}

	private async save() {
		await mkdir(path.dirname(this.file), { recursive: true })

		const tmp = `${this.file}.tmp`
		await writeFile(tmp, JSON.stringify({ tickets: this.tickets }, null, 2), 'utf8')
		await rename(tmp, this.file)
	}

	getOpenTicket(guildId: string, userId: string) {
		return this.tickets.find(
			t => t.guildId === guildId && t.userId === userId && t.status === 'OPEN'
		)
	}

	isTicketChannel(channelId: string) {
		return this.tickets.some(t => t.channelId === channelId && t.status === 'OPEN')
	}

	async create(ticket: Omit<Ticket, 'status' | 'createdAt'>) {
		const newTicket: Ticket = {
			...ticket,
			status: 'OPEN',
			createdAt: new Date().toISOString(),
		}

		this.tickets.push(newTicket)
		await this.save()

		return newTicket
	}

	async close(channelId: string) {
		const ticket = this.tickets.find(t => t.channelId === channelId && t.status === 'OPEN')

		if (!ticket) return null

		ticket.status = 'CLOSED'
		ticket.closedAt = new Date().toISOString()

		await this.save()
		return ticket
	}

	async cleanup(missingChannelIds: Set<string>) {
		let changed = false

		for (const ticket of this.tickets) {
			if (ticket.status === 'OPEN' && !missingChannelIds.has(ticket.channelId)) {
				ticket.status = 'CLOSED'
				ticket.closedAt = new Date().toISOString()
				changed = true
			}
		}

		if (changed) await this.save()
	}
}

export const ticketStore = new TicketStore()
