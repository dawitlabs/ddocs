import { getInstalledSets, installDocSet, uninstallDocSet } from '$lib/db/client.js';
import { addDocSetToSearch, removeDocSetFromSearch } from '$lib/search/engine.js';
import type { InstalledDocSet } from '$lib/types.js';

class InstalledState {
	sets = $state<Map<string, InstalledDocSet>>(new Map());
	installing = $state<Map<string, number>>(new Map());

	isInstalled(slug: string): boolean {
		return this.sets.has(slug);
	}

	isInstalling(slug: string): boolean {
		return this.installing.has(slug);
	}

	progress(slug: string): number {
		return this.installing.get(slug) ?? 0;
	}

	count = $derived(this.sets.size);

	async init() {
		const all = await getInstalledSets();
		const map = new Map<string, InstalledDocSet>();
		for (const s of all) {
			map.set(s.slug, s);
		}
		this.sets = map;
	}

	async install(slug: string, name: string, version: string) {
		if (this.sets.has(slug) || this.installing.has(slug)) return;

		this.installing = new Map(this.installing).set(slug, 0);

		try {
			const index = await installDocSet(slug, name, version, (pct) => {
				this.installing = new Map(this.installing).set(slug, pct);
			});

			await addDocSetToSearch(slug, name, index.entries);

			const meta: InstalledDocSet = {
				slug,
				name,
				version,
				installedAt: Date.now(),
				entryCount: index.entries.length,
				sizeBytes: 0,
			};
			this.sets = new Map(this.sets).set(slug, meta);
		} finally {
			const next = new Map(this.installing);
			next.delete(slug);
			this.installing = next;
		}
	}

	async uninstall(slug: string) {
		await uninstallDocSet(slug);
		await removeDocSetFromSearch(slug);

		const next = new Map(this.sets);
		next.delete(slug);
		this.sets = next;
	}
}

export const installed = new InstalledState();
