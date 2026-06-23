import type { DocCategory, DocSetMeta } from '$lib/types.js';

class CatalogState {
	docSets = $state<DocSetMeta[]>([]);
	filter = $state('');
	activeCategory = $state<DocCategory | ''>('');

	filtered = $derived.by(() => {
		let result = this.docSets;

		if (this.activeCategory) {
			result = result.filter((d) => d.category === this.activeCategory);
		}

		if (this.filter) {
			const q = this.filter.toLowerCase();
			result = result.filter(
				(d) => d.name?.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q),
			);
		}

		return result;
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

	setCategory(cat: DocCategory | '') {
		this.activeCategory = cat;
	}

	setFilter(q: string) {
		this.filter = q;
	}
}

export const catalog = new CatalogState();
