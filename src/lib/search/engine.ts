import MiniSearch from 'minisearch';
import type { DocEntry, SearchResult } from '$lib/types.js';
import { saveSearchIndex, getSearchIndex, getAllSearchIndexSlugs } from '$lib/db/client.js';

type SearchDoc = {
	id: string;
	slug: string;
	docName: string;
	name: string;
	path: string;
	type: string;
};

const FIELDS = ['name', 'type', 'docName'] as const;
const STORE_FIELDS = ['slug', 'docName', 'name', 'path', 'type'] as const;

let engine: MiniSearch<SearchDoc> | null = null;

function getEngine(): MiniSearch<SearchDoc> {
	if (!engine) {
		engine = new MiniSearch<SearchDoc>({
			fields: [...FIELDS],
			storeFields: [...STORE_FIELDS],
			searchOptions: {
				prefix: true,
				fuzzy: 0.2,
				combineWith: 'AND',
				boost: { name: 3, type: 1, docName: 0.5 },
			},
		});
	}
	return engine;
}

export async function initSearch(): Promise<void> {
	const slugs = await getAllSearchIndexSlugs();
	const eng = getEngine();

	for (const slug of slugs) {
		const serialized = await getSearchIndex(slug);
		if (serialized) {
			const parsed = JSON.parse(serialized) as SearchDoc[];
			eng.addAll(parsed);
		}
	}
}

export async function addDocSetToSearch(
	slug: string,
	docName: string,
	entries: DocEntry[],
): Promise<void> {
	const eng = getEngine();

	const docs: SearchDoc[] = entries.map((entry) => ({
		id: `${slug}::${entry.path}`,
		slug,
		docName,
		name: entry.name,
		path: entry.path,
		type: entry.type,
	}));

	eng.addAll(docs);
	await saveSearchIndex(slug, JSON.stringify(docs));
}

export async function removeDocSetFromSearch(slug: string): Promise<void> {
	const eng = getEngine();
	const serialized = await getSearchIndex(slug);
	if (serialized) {
		const docs = JSON.parse(serialized) as SearchDoc[];
		for (const doc of docs) {
			eng.discard(doc.id);
		}
	}
}

export function search(
	query: string,
	options?: { slug?: string; type?: string; limit?: number },
): SearchResult[] {
	if (!query.trim()) return [];

	const eng = getEngine();
	const limit = options?.limit ?? 50;

	const results = eng.search(query, {
		filter: (result) => {
			if (options?.slug && result.slug !== options.slug) return false;
			if (options?.type && result.type !== options.type) return false;
			return true;
		},
	});

	return results.slice(0, limit).map((r) => ({
		id: r.id,
		docSlug: r.slug,
		docName: r.docName,
		entryName: r.name,
		entryPath: r.path,
		entryType: r.type,
		score: r.score,
	}));
}

export function searchInDocSet(slug: string, query: string, limit = 30): SearchResult[] {
	return search(query, { slug, limit });
}
