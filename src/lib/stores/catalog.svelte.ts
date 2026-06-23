import type { DocGroup, DocSetMeta } from '$lib/types.js';

function buildGroups(docSets: DocSetMeta[]): DocGroup[] {
	const map = new Map<string, DocSetMeta[]>();
	for (const d of docSets) {
		const base = d.slug.split('~')[0];
		const arr = map.get(base);
		if (arr) arr.push(d);
		else map.set(base, [d]);
	}
	const groups: DocGroup[] = [];
	for (const [baseSlug, versions] of map) {
		const sorted = versions.sort((a, b) => {
			if (!a.version && !b.version) return 0;
			if (!a.version) return -1;
			if (!b.version) return 1;
			return b.version.localeCompare(a.version, undefined, { numeric: true });
		});
		groups.push({
			baseSlug,
			name: sorted[0].name,
			category: sorted[0].category,
			versions: sorted,
			latestVersion: sorted[0].version,
		});
	}
	return groups.sort((a, b) => a.name.localeCompare(b.name));
}

class CatalogState {
	docSets = $state<DocSetMeta[]>([]);

	groups = $derived.by(() => buildGroups(this.docSets));

	groupCategoryCounts = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const g of this.groups) {
			counts[g.category] = (counts[g.category] ?? 0) + 1;
		}
		return counts;
	});

	categoryCounts = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const doc of this.docSets) {
			counts[doc.category] = (counts[doc.category] ?? 0) + 1;
		}
		return counts;
	});

	init(docSets: DocSetMeta[]) {
		this.docSets = docSets;
	}

	getGroup(baseSlug: string): DocGroup | undefined {
		return this.groups.find((g) => g.baseSlug === baseSlug);
	}
}

export const catalog = new CatalogState();
