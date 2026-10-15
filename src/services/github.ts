import 'dotenv/config'

interface GitHubData {
	version: string
	downloads: number
}

interface GitHubAsset {
	name: string
	download_count: number
}

interface GitHubRelease {
	tag_name: string
	assets: GitHubAsset[]
}

async function fetchAllReleases(): Promise<any[]> {
	const releases: any[] = []
	let page = 1
	let token = process.env.GITHUB_TOKEN

	while (true) {
		const res = await fetch(
			`https://api.github.com/repos/Devollox/void-presence/releases?per_page=100&page=${page}`,
			{
				method: 'GET',
				headers: {
					'User-Agent': 'Void-Presence-Updater-Script',
					Authorization: `Bearer ${token}`,
					Accept: 'application/vnd.github+json',
					'X-GitHub-Api-Version': '2022-11-28',
				},
			}
		)

		if (!res.ok) break

		const data = await res.json()

		if (!Array.isArray(data) || data.length === 0) break

		releases.push(...data)

		if (data.length < 100) break

		page++
	}

	return releases
}

export async function getGitHubData(): Promise<GitHubData> {
	try {
		const releases = await fetchAllReleases()

		if (releases.length === 0) throw new Error('No releases found')

		const version: string = releases[0].tag_name.replace('v', '')

		const totalDownloads = releases
			.flatMap((release: GitHubRelease) => release.assets ?? [])
			.reduce((sum: number, asset: GitHubAsset) => sum + (asset.download_count ?? 0), 0)

		return { version, downloads: totalDownloads }
	} catch (err) {
		console.error('Error fetching GitHub data:', err)

		return { version: '0.0.0', downloads: 0 }
	}
}
